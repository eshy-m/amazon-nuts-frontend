import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// 🔥 IMPORTACIÓN DE SWEETALERT (Para las alertas bonitas)
import Swal from 'sweetalert2';

// IMPORTACIONES PARA REPORTES Y FOTOCHECK
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

import { environment } from '../../../environments/environment';
import { TrabajadorService } from '../../services/trabajador';

@Component({
  selector: 'app-trabajador',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './trabajador.html',
  styleUrls: ['./trabajador.css']
})
export class Trabajador implements OnInit {

  public baseStorageUrl: string = environment.storageUrl;
  public apiUrl: string = environment.apiUrl;

  // Variables para la Vista
  public lista: any[] = [];
  public estadisticas: any[] = [];
  public totalPersonal: number = 0;

  // Variables para Maestros (Cargos y Áreas)
  public cargosMaestros: any[] = [];
  public areasMaestras: any[] = [];

  // Control de Modales
  public mostrarModalForm = false;
  public mostrarModalFotocheck = false;
  public trabajadorSeleccionado: any = null;
  public esEdicion = false;

  // Variables para Buscador y Paginación
  public textoBusqueda: string = '';
  public paginaActual: number = 1;
  public itemsPorPagina: number = 10;

  // Variables de Foto
  public fotoSeleccionada: File | null = null;
  public fotoPreview: string | ArrayBuffer | null = null;

  // Objeto del formulario
  public trabajador: any = this.obtenerFormularioVacio();

  constructor(
    private api: TrabajadorService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarMaestros();
  }

  // 🔥 ESTA ES LA FUNCIÓN MAESTRA QUE RECARGA LA TABLA Y LAS ESTADÍSTICAS JUNTAS
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

  cargarMaestros() {
    this.http.get(`${this.apiUrl}/maestros/cargos`).subscribe((res: any) => {
      if (res.status) this.cargosMaestros = res.data;
    });

    this.http.get(`${this.apiUrl}/maestros/areas`).subscribe((res: any) => {
      if (res.status) this.areasMaestras = res.data;
    });
  }

  // ==========================================
  // LÓGICA DE BÚSQUEDA Y PAGINACIÓN
  // ==========================================

  get trabajadoresFiltrados() {
    if (!this.textoBusqueda) {
      return this.lista;
    }
    const termino = this.textoBusqueda.toLowerCase();
    return this.lista.filter(t =>
      (t.dni && t.dni.toLowerCase().includes(termino)) ||
      (t.nombres && t.nombres.toLowerCase().includes(termino)) ||
      (t.apellidos && t.apellidos.toLowerCase().includes(termino))
    );
  }

  get trabajadoresPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.trabajadoresFiltrados.slice(inicio, fin);
  }

  get itemInicial(): number {
    return this.trabajadoresFiltrados.length === 0 ? 0 : (this.paginaActual - 1) * this.itemsPorPagina + 1;
  }

  get itemFinal(): number {
    const final = this.paginaActual * this.itemsPorPagina;
    return final > this.trabajadoresFiltrados.length ? this.trabajadoresFiltrados.length : final;
  }

  get totalPaginas() {
    return Math.ceil(this.trabajadoresFiltrados.length / this.itemsPorPagina);
  }

  get paginas() {
    return Array(this.totalPaginas).fill(0).map((x, i) => i + 1);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  cambiarItemsPorPagina() {
    this.paginaActual = 1;
  }

  buscar() {
    this.paginaActual = 1;
  }

  esTrabajadorActivo(t: any): boolean {
    return t.activo == 1 || t.activo === true || t.activo === '1';
  }

  // ==========================================
  // LÓGICA DEL FORMULARIO
  // ==========================================
  obtenerFormularioVacio() {
    return {
      id: null,
      dni: '',
      nombres: '',
      apellidos: '',
      cargo_id: '',
      area_id: '',
      genero: '',
      condicion_laboral: 'Estable',
      celular: '',
      direccion: '',
      observaciones: '',
      fecha_nacimiento: '',
      fecha_inicio: '',
      experiencia_bool: false,
      activo: true,
      fecha_fin: '',
      fecha_vencimiento_carnet: '',
      contacto_emergencia: '',
      numero_emergencia: '',
      tipo_pago: '',
      cuenta_pago: ''
    };
  }

  abrirModalNuevo() {
    this.esEdicion = false;
    this.trabajador = this.obtenerFormularioVacio();
    this.fotoSeleccionada = null;
    this.fotoPreview = null;
    this.mostrarModalForm = true;
  }

  editar(t: any) {
    this.esEdicion = true;
    this.trabajador = { ...t };
    this.trabajador.cargo_id = t.cargo_id || '';
    this.trabajador.area_id = t.area_id || '';

    this.trabajador.experiencia_bool = (t.experiencia === 'SÍ');
    this.fotoPreview = t.foto ? this.baseStorageUrl + t.foto : null;
    this.fotoSeleccionada = null;
    this.mostrarModalForm = true;
  }

  cerrarModalForm() {
    this.mostrarModalForm = false;
    this.trabajador = this.obtenerFormularioVacio();
    this.fotoSeleccionada = null;
    this.fotoPreview = null;
  }

  abrirModalFotocheck(t: any) {
    this.trabajadorSeleccionado = t;
    this.mostrarModalFotocheck = true;
  }

  cerrarModalFotocheck() {
    this.mostrarModalFotocheck = false;
    this.trabajadorSeleccionado = null;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('Atención', 'La imagen es muy pesada. Máximo 2MB.', 'warning');
        return;
      }
      this.fotoSeleccionada = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // ==========================================
  // 💾 GUARDAR / ACTUALIZAR (CON SWEETALERT)
  // ==========================================
  guardar() {
    // Validación con SweetAlert
    if (!this.trabajador.dni || String(this.trabajador.dni).length !== 8) {
      Swal.fire('Atención', 'El DNI debe tener exactamente 8 dígitos.', 'warning');
      return;
    }
    if (!this.trabajador.nombres || !this.trabajador.apellidos) {
      Swal.fire('Atención', 'Por favor, completa los nombres y apellidos.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('dni', this.trabajador.dni);
    formData.append('nombres', this.trabajador.nombres);
    formData.append('apellidos', this.trabajador.apellidos);
    formData.append('cargo_id', this.trabajador.cargo_id);
    formData.append('area_id', this.trabajador.area_id);
    formData.append('genero', this.trabajador.genero);
    formData.append('condicion_laboral', this.trabajador.condicion_laboral);
    formData.append('activo', this.trabajador.activo ? '1' : '0');

    if (this.trabajador.fecha_vencimiento_carnet) formData.append('fecha_vencimiento_carnet', this.trabajador.fecha_vencimiento_carnet);
    if (this.trabajador.contacto_emergencia) formData.append('contacto_emergencia', this.trabajador.contacto_emergencia);
    if (this.trabajador.numero_emergencia) formData.append('numero_emergencia', this.trabajador.numero_emergencia);
    if (this.trabajador.tipo_pago) formData.append('tipo_pago', this.trabajador.tipo_pago);
    if (this.trabajador.cuenta_pago) formData.append('cuenta_pago', this.trabajador.cuenta_pago);
    if (this.trabajador.fecha_fin) formData.append('fecha_fin', this.trabajador.fecha_fin);
    if (this.trabajador.fecha_nacimiento) formData.append('fecha_nacimiento', this.trabajador.fecha_nacimiento);
    if (this.trabajador.fecha_inicio) formData.append('fecha_inicio', this.trabajador.fecha_inicio);
    if (this.trabajador.celular) formData.append('celular', this.trabajador.celular);
    if (this.trabajador.direccion) formData.append('direccion', this.trabajador.direccion);
    if (this.trabajador.observaciones) formData.append('observaciones', this.trabajador.observaciones);
    formData.append('experiencia', this.trabajador.experiencia_bool ? 'SÍ' : 'NO');

    if (this.fotoSeleccionada) {
      formData.append('foto', this.fotoSeleccionada);
    }

    if (this.esEdicion) {
      this.api.actualizarConFoto(this.trabajador.id, formData).subscribe({
        next: () => {
          Swal.fire('¡Actualizado!', 'Trabajador modificado con éxito', 'success');
          this.cerrarModalForm();
          this.cargarDatos(); // 🔥 Llamamos a cargarDatos
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Hubo un problema al actualizar.', 'error');
        }
      });
    } else {
      this.api.registrar(formData as any).subscribe({
        next: () => {
          Swal.fire('¡Registrado!', 'Trabajador creado con éxito', 'success');
          this.cerrarModalForm();
          this.cargarDatos(); // 🔥 Llamamos a cargarDatos
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Hubo un problema al registrar.', 'error');
        }
      });
    }
  }

  // ==========================================
  // 🗑️ ELIMINAR (CON SWEETALERT)
  // ==========================================
  eliminar(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará al trabajador, su foto y su fotocheck. ¡Esta acción no se puede deshacer!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.eliminar(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El trabajador ha sido eliminado.', 'success');
            this.cargarDatos(); // 🔥 Llamamos a cargarDatos
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar al trabajador.', 'error');
          }
        });
      }
    });
  }

  // ==========================================
  // 📊 EXPORTAR A EXCEL 
  // ==========================================
  exportarExcel() {
    const dataAExportar = this.lista.map((t, index) => ({
      'N°': index + 1,
      'DNI': t.dni,
      'Nombres': t.nombres,
      'Apellidos': t.apellidos,
      'Fecha Nacimiento': t.fecha_nacimiento || '---',
      'Género': t.genero,
      'Área': t.area_maestra?.nombre || t.area_id || '---',
      'Cargo': t.cargo_maestro?.nombre || t.cargo_id || '---',
      'Condición Laboral': t.condicion_laboral,
      'Fecha Inicio (Contrato)': t.fecha_inicio || '---',
      'Celular': t.celular || '---',
      'Dirección': t.direccion || '---',
      'Experiencia': t.experiencia || 'NO',
      'Observaciones': t.observaciones || '---'
    }));
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataAExportar);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trabajadores');
    XLSX.writeFile(workbook, 'Reporte_Personal.xlsx');
  }

  // ==========================================
  // 📄 EXPORTAR A PDF (REPORTES)
  // ==========================================
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
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    try {
      const logoUrl = 'assets/img/logo_reporte.png';
      const logoBase64 = await this.loadImage(logoUrl);

      doc.addImage(logoBase64, 'JPEG', 14, 10, 35, 15);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59);
      doc.text('LISTA DE PERSONAL', pageWidth / 2, 20, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100);
      const fechaActual = new Date().toLocaleDateString();
      doc.text(`FECHA: ${fechaActual}`, pageWidth - 14, 20, { align: 'right' });

      const headers = [
        ['N°', 'DNI', 'APELLIDOS Y NOMBRES', 'CARGO / ÁREA', 'FECHA INICIO', 'CONTACTO', 'DIRECCIÓN', 'ESTADO']
      ];

      const dataPDF = this.lista.map((t, index) => [
        index + 1,
        t.dni,
        `${t.apellidos}, ${t.nombres}`,
        `${t.cargo_maestro?.nombre || ''} / ${t.area_maestra?.nombre || ''}`,
        t.fecha_inicio ? t.fecha_inicio : '---',
        t.celular || '---',
        t.direccion || '---',
        t.activo ? 'ACTIVO' : 'INACTIVO' + '\n' + t.fecha_fin
      ]);

      autoTable(doc, {
        head: headers,
        body: dataPDF,
        startY: 32,
        theme: 'grid',
        styles: { fontSize: 8.5, cellPadding: 3, valign: 'middle' },
        headStyles: { fillColor: [21, 128, 61], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      });

      doc.save(`LISTA_PERSONAL_${fechaActual}.pdf`);

    } catch (error) {
      console.error('Error generando PDF:', error);
      Swal.fire('Aviso', 'Error generando PDF. Asegúrate de tener el logo_reporte.png', 'warning');
    }
  }

  // ==========================================
  // 🔥 GENERAR PDF FOTOCHECK
  // ==========================================
  generarPDF_Fotocheck(t: any) {
    const DATA = document.getElementById('fotocheck_preview');

    if (!DATA) {
      Swal.fire('Error', 'No se pudo encontrar el área de previsualización del fotocheck.', 'error');
      return;
    }

    // Alerta de cargando para el fotocheck
    Swal.fire({
      title: 'Generando Fotocheck...',
      text: 'Por favor espera un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    html2canvas(DATA, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [54, 86]
      });

      doc.addImage(imgData, 'JPEG', 0, 0, 54, 86);
      const nombreArchivo = `Fotocheck_${t.dni}_${t.apellidos.replace(/ /g, '_')}.pdf`;
      doc.save(nombreArchivo);

      Swal.fire('¡Éxito!', 'PDF generado correctamente. Imprímelo en tamaño real.', 'success');
    }).catch(err => {
      Swal.fire('Error', 'Hubo un problema al generar la imagen del fotocheck.', 'error');
    });
  }
}