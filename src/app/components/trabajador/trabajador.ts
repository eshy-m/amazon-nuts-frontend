import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Variables de entorno y servicio
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

  // URL base para los QRs y Fotos (viene de los environments)
  public baseStorageUrl: string = environment.storageUrl;

  // 📊 Variables para la Vista (Dashboard)
  public lista: any[] = [];
  public estadisticas: any[] = [];
  public totalPersonal: number = 0;

  // 🪟 Control de Ventanas Modales
  public mostrarModalForm = false;
  public mostrarModalFotocheck = false;
  public trabajadorSeleccionado: any = null;
  public esEdicion = false; // Define si el modal es para Crear o Editar

  // 🔥 Variables para manejar la Foto de Perfil
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

  // ==========================================
  // 🔄 CARGA DE DATOS
  // ==========================================
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
  // 🪟 CONTROL DE MODALES
  // ==========================================
  obtenerFormularioVacio() {
    return {
      id: null,
      dni: '',
      nombres: '',
      apellidos: '',
      area: '',
      genero: '',
      fecha_nacimiento: '',
      celular: '',
      direccion: '',
      fecha_inicio: '',
      condicion_laboral: 'Estable' // 🔥 Por defecto Estable
    };
  }

  abrirModalNuevo() {
    this.esEdicion = false;
    this.form = this.obtenerFormularioVacio();
    this.fotoSeleccionada = null;
    this.fotoPreview = null;
    this.mostrarModalForm = true;
  }

  editar(t: any) {
    this.esEdicion = true;
    this.form = { ...t }; // Clonamos los datos

    // 🔥 Si tiene foto en la BD, la mostramos en la vista previa
    if (t.foto) {
      this.fotoPreview = this.baseStorageUrl + t.foto;
    } else {
      this.fotoPreview = null;
    }
    this.fotoSeleccionada = null; // Reseteamos el archivo físico

    this.mostrarModalForm = true;
  }

  cerrarModalForm() {
    this.mostrarModalForm = false;
    this.form = this.obtenerFormularioVacio();
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

  // ==========================================
  // 📷 LÓGICA DE LA FOTO
  // ==========================================
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // Máximo 2MB
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es muy pesada. Máximo 2MB.');
        return;
      }
      this.fotoSeleccionada = file;

      // Generar vista previa circular
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // ==========================================
  // 💾 GUARDAR / ACTUALIZAR (Usando FormData)
  // ==========================================
  guardar() {
    // Validaciones básicas
    if (!this.form.dni || String(this.form.dni).length !== 8) {
      alert('El DNI debe tener exactamente 8 dígitos.');
      return;
    }
    if (!this.form.area || !this.form.genero || !this.form.nombres || !this.form.apellidos) {
      alert('Por favor, completa los campos obligatorios (Área, Género, Nombres, Apellidos).');
      return;
    }

    // 🔥 EMPAQUETAMOS TODO EN UN FORMDATA PARA PODER ENVIAR LA IMAGEN AL BACKEND
    const formData = new FormData();
    formData.append('dni', this.form.dni);
    formData.append('nombres', this.form.nombres);
    formData.append('apellidos', this.form.apellidos);
    formData.append('area', this.form.area);
    formData.append('genero', this.form.genero);
    formData.append('condicion_laboral', this.form.condicion_laboral);

    // Adjuntamos opcionales solo si tienen texto
    if (this.form.celular) formData.append('celular', this.form.celular);
    if (this.form.direccion) formData.append('direccion', this.form.direccion);
    if (this.form.fecha_nacimiento) formData.append('fecha_nacimiento', this.form.fecha_nacimiento);
    if (this.form.fecha_inicio) formData.append('fecha_inicio', this.form.fecha_inicio);

    // Adjuntamos la foto si el usuario subió una
    if (this.fotoSeleccionada) {
      formData.append('foto', this.fotoSeleccionada);
    }

    if (this.esEdicion) {
      // 🌟 Usamos el nuevo método del servicio
      this.api.actualizarConFoto(this.form.id, formData).subscribe({
        next: () => {
          alert('¡Trabajador actualizado con éxito!');
          this.cerrarModalForm();
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar. Verifica los datos.');
        }
      });
    } else {
      this.api.registrar(formData as any).subscribe({
        next: () => {
          alert('¡Trabajador registrado y QR generado con éxito!');
          this.cerrarModalForm();
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          alert('Error al registrar. Verifica que el DNI no esté duplicado.');
        }
      });
    }
  }

  // ==========================================
  // 🗑️ ELIMINAR
  // ==========================================
  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este trabajador?')) {
      this.api.eliminar(id).subscribe({
        next: () => {
          alert('Trabajador eliminado.');
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          alert('Error al eliminar.');
        }
      });
    }
  }

  // 🖨️ Imprimir
  imprimirFotocheck(): void {
    window.print();
  }
}