import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// 🔥 IMPORTACIONES PARA REPORTES (Asegúrate de tenerlas instaladas via npm)
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Variables de entorno y servicio...
import { environment } from '../../../environments/environment';
import { TrabajadorService } from '../../services/trabajador';

@Component({
  selector: 'app-trabajador',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './trabajador.html',
  styleUrls: ['./trabajador.css']
})
export class TrabajadorComponent implements OnInit {

  public baseStorageUrl: string = environment.storageUrl;

  // Variables para la Vista
  public lista: any[] = [];
  public estadisticas: any[] = [];
  public totalPersonal: number = 0;

  // Control de Modales
  public mostrarModalForm = false;
  public mostrarModalFotocheck = false;
  public trabajadorSeleccionado: any = null;
  public esEdicion = false;

  // Variables de Foto
  public fotoSeleccionada: File | null = null;
  public fotoPreview: string | ArrayBuffer | null = null;

  // Objeto del formulario
  public form: any = this.obtenerFormularioVacio();

  constructor(
    private api: TrabajadorService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.listar().subscribe((res: any) => {
      this.lista = res.data;
      this.cdr.detectChanges();
    });

    this.api.getEstadisticas().subscribe((res: any) => {
      this.estadisticas = res.data.por_area;
      this.totalPersonal = res.data.total;
      this.cdr.detectChanges();
    });
  }

  // ==========================================
  // LÓGICA DEL FORMULARIO (Se mantiene igual)
  // ==========================================
  obtenerFormularioVacio() {
    return { id: null, dni: '', nombres: '', apellidos: '', area: '', genero: '', condicion_laboral: 'Estable', celular: '', direccion: '', observaciones: '', fecha_nacimiento: '', fecha_inicio: '', experiencia_bool: false };
  }

  abrirModalNuevo() {
    this.esEdicion = false; this.form = this.obtenerFormularioVacio(); this.fotoSeleccionada = null; this.fotoPreview = null; this.mostrarModalForm = true;
  }

  editar(t: any) {
    this.esEdicion = true; this.form = { ...t }; this.form.experiencia_bool = (t.experiencia === 'SÍ');
    if (t.foto) { this.fotoPreview = this.baseStorageUrl + t.foto; } else { this.fotoPreview = null; }
    this.fotoSeleccionada = null; this.mostrarModalForm = true;
  }

  cerrarModalForm() {
    this.mostrarModalForm = false; this.form = this.obtenerFormularioVacio(); this.fotoSeleccionada = null; this.fotoPreview = null;
  }

  abrirModalFotocheck(t: any) { this.trabajadorSeleccionado = t; this.mostrarModalFotocheck = true; }
  cerrarModalFotocheck() { this.mostrarModalFotocheck = false; this.trabajadorSeleccionado = null; }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { alert('La imagen es muy pesada. Máximo 2MB.'); return; }
      this.fotoSeleccionada = file;
      const reader = new FileReader(); reader.onload = () => { this.fotoPreview = reader.result; }; reader.readAsDataURL(file);
    }
  }

  // ==========================================
  // 💾 GUARDAR / ELIMINAR (Se mantiene igual)
  // ==========================================
  guardar() {
    if (!this.form.dni || String(this.form.dni).length !== 8) { alert('El DNI debe tener exactamente 8 dígitos.'); return; }
    if (!this.form.area || !this.form.genero || !this.form.nombres || !this.form.apellidos) { alert('Por favor, completa los campos obligatorios (*).'); return; }
    const formData = new FormData();
    formData.append('dni', this.form.dni); formData.append('nombres', this.form.nombres); formData.append('apellidos', this.form.apellidos); formData.append('area', this.form.area); formData.append('genero', this.form.genero); formData.append('condicion_laboral', this.form.condicion_laboral);
    if (this.form.fecha_nacimiento) formData.append('fecha_nacimiento', this.form.fecha_nacimiento); if (this.form.fecha_inicio) formData.append('fecha_inicio', this.form.fecha_inicio);
    if (this.form.celular) formData.append('celular', this.form.celular); if (this.form.direccion) formData.append('direccion', this.form.direccion); if (this.form.observaciones) formData.append('observaciones', this.form.observaciones);
    formData.append('experiencia', this.form.experiencia_bool ? 'SÍ' : 'NO');
    if (this.fotoSeleccionada) { formData.append('foto', this.fotoSeleccionada); }
    if (this.esEdicion) {
      this.api.actualizarConFoto(this.form.id, formData).subscribe({ next: () => { alert('¡Trabajador actualizado con éxito!'); this.cerrarModalForm(); this.cargarDatos(); }, error: (err) => { console.error(err); alert('Error al actualizar.'); } });
    } else { this.api.registrar(formData as any).subscribe({ next: () => { alert('¡Trabajador registrado con éxito!'); this.cerrarModalForm(); this.cargarDatos(); }, error: (err) => { console.error(err); alert('Error al registrar.'); } }); }
  }

  eliminar(id: number) { if (confirm('¿Estás seguro?')) { this.api.eliminar(id).subscribe({ next: () => { alert('Eliminado.'); this.cargarDatos(); }, error: (err) => { console.error(err); alert('Error.'); } }); } }
  imprimirFotocheck(): void { window.print(); }

  // ==========================================
  // 📊 EXPORTAR A EXCEL (Todo el contenido)
  // ==========================================
  exportarExcel() {
    const dataAExportar = this.lista.map((t, index) => ({
      'N°': index + 1, 'DNI': t.dni, 'Nombres': t.nombres, 'Apellidos': t.apellidos, 'Fecha Nacimiento': t.fecha_nacimiento || '---', 'Género': t.genero, 'Área / Cargo': t.area, 'Condición Laboral': t.condicion_laboral, 'Fecha Inicio (Contrato)': t.fecha_inicio || '---', 'Celular': t.celular || '---', 'Dirección': t.direccion || '---', 'Experiencia': t.experiencia || 'NO', 'Observaciones': t.observaciones || '---'
    }));
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataAExportar);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trabajadores');
    XLSX.writeFile(workbook, 'Reporte_Personal_AmazonNuts.xlsx');
  }

  // ==========================================
  // 📄 EXPORTAR A PDF (🔥 MODELO EXACTO)
  // ==========================================

  // Función auxiliar para cargar imagen y convertir a Base64
  private loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  }

  async exportarPDF() {
    // 1. Iniciamos PDF Horizontal (landscape), A4
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    try {
      // 2. 🔥 Cargar el Logo desde Assets
      const logoUrl = 'assets/img/logo_reporte.png';
      const logoBase64 = await this.loadImage(logoUrl);

      // 3. 🟢 DISEÑAR CABECERA (Estilo exacto del modelo)

      // Logo (Izquierda)
      doc.addImage(logoBase64, 'JPEG', 14, 10, 35, 15); // x, y, ancho, alto

      // Título Central
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59); // Gris oscuro
      doc.text('LISTA DE PERSONAL DE CAMPAÑA 2026', pageWidth / 2, 20, { align: 'center' });

      // Fecha (Derecha)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100);
      const fechaActual = new Date().toLocaleDateString();
      doc.text(`FECHA: ${fechaActual}`, pageWidth - 14, 20, { align: 'right' });

      // 4. 🟢 MAPEAR DATOS A LA TABLA (Añadiendo Fecha de Inicio)
      const headers = [['N°', 'DNI', 'APELLIDOS Y NOMBRES', 'ÁREA / CARGO', 'FECHA INICIO', 'N° CELULAR', 'DIRECCIÓN', 'EXPERIENCIA']];
      const dataPDF = this.lista.map((t, index) => [
        index + 1,
        t.dni,
        `${t.apellidos}, ${t.nombres}`, // Combinado
        t.area,
        t.fecha_inicio ? t.fecha_inicio : '---', // 🔥 NUEVA COLUMNA AQUÍ
        t.celular || '---',
        t.direccion || '---',
        t.experiencia || 'NO'
      ]);

      // 5. 🟢 GENERAR TABLA CON AUTO-TABLE (Anchos recalculados)
      autoTable(doc, {
        head: headers,
        body: dataPDF,
        startY: 32, // Debajo de la cabecera
        theme: 'grid',
        styles: { fontSize: 8.5, cellPadding: 3, valign: 'middle' }, // Letra un poquitito más pequeña para que encaje todo

        // Estilo de Cabecera (Verde exacto estilo Amazon Nuts)
        headStyles: {
          fillColor: [21, 128, 61],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },

        // Configuración de anchos ajustada para 8 columnas
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 }, // N°
          1: { halign: 'center', cellWidth: 20 }, // DNI
          2: { cellWidth: 60 },                   // Apellidos y Nombres
          3: { cellWidth: 40 },                   // Área / Cargo
          4: { halign: 'center', cellWidth: 25 }, // 🔥 FECHA INICIO
          5: { halign: 'center', cellWidth: 23 }, // Celular
          // La columna 6 (Dirección) toma el espacio restante automáticamente
          7: { halign: 'center', cellWidth: 23 }  // Experiencia
        },

        alternateRowStyles: { fillColor: [245, 250, 245] },
      });
      // 6. 🟢 DESCARGAR EL ARCHIVO
      doc.save(`LISTA_PERSONAL_AMAZON_NUTS_CAMPAÑA_2026_${fechaActual}.pdf`);

    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un error al generar el PDF. Asegúrate de haber guardado el logo en "assets/img/logo_reporte.jpg".');
    }
  }
}