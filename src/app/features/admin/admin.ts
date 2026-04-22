import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
// 👇 AGREGADO: Importación de tu environment (verifica que la ruta de carpetas sea la correcta)
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  mensajes: any[] = [];
  mensajesFiltrados: any[] = [];

  // PAGINACIÓN
  paginaActual: number = 1;
  itemsPorPagina: number = 10;

  cargando: boolean = true;
  usuarioLogueado: string = 'Admin';

  // ESTADÍSTICAS
  totalMensajes: number = 0;
  mensajesNuevos: number = 0;
  mensajesRespondidos: number = 0;

  // MODAL
  modalVisible: boolean = false;
  mensajeSeleccionado: any = null;
  enviandoRespuesta: boolean = false;

  ngOnInit() {
    const token = localStorage.getItem('auth_token');

    if (!token || token === 'undefined') {
      this.cerrarSesion();
      return;
    }

    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        this.usuarioLogueado = user.name || 'Admin';
      }
    } catch (e) { console.warn('Error al leer user_data'); }

    this.cargarMensajes();
  }

  // 👇 LIMPIO: Ya no necesitamos pasar el token manualmente, el interceptor lo hace.
  cargarMensajes() {
    this.http.get(`${environment.apiUrl}/messages`).subscribe({
      next: (res: any) => {
        this.mensajes = res;
        this.mensajesFiltrados = res;
        this.cargando = false;
        this.calcularEstadisticas();
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cerrarSesion();
      }
    });
  }

  abrirModal(msg: any) {
    this.mensajeSeleccionado = msg;
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.mensajeSeleccionado = null;
  }

  verDetalles(mensaje: any) {
    this.mensajeSeleccionado = mensaje;
    this.modalVisible = true;

    if (mensaje.status === 'unread') {
      this.cambiarEstado(mensaje.id, 'read');
    }
  }

  // 👇 CORREGIDO: Uso de acentos graves (backticks) y sin cabeceras manuales
  enviarRespuesta(texto: string, id: number) {
    if (!texto.trim()) {
      alert('Por favor, escribe una respuesta.');
      return;
    }

    this.enviandoRespuesta = true;

    this.http.post(`${environment.apiUrl}/messages/${id}/reply`, { reply_message: texto })
      .subscribe({
        next: () => {
          this.enviandoRespuesta = false;
          const index = this.mensajes.findIndex(m => m.id === id);
          if (index !== -1) {
            this.mensajes[index].status = 'replied';
          }
          this.calcularEstadisticas();
          this.cerrarModal();
          this.cdr.detectChanges();
          alert('¡Respuesta enviada con éxito al correo del cliente!');
        },
        error: () => {
          this.enviandoRespuesta = false;
          this.cdr.detectChanges();
          alert('Hubo un error al intentar enviar el correo. Revisa tu conexión.');
        }
      });
  }

  // 👇 CORREGIDO: Uso de acentos graves
  eliminarMensaje(id: number) {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar esta cotización? Esta acción la quitará de tu bandeja.');

    if (confirmar) {
      this.http.delete(`${environment.apiUrl}/messages/${id}`)
        .subscribe({
          next: () => {
            this.mensajes = this.mensajes.filter(m => m.id !== id);
            this.mensajesFiltrados = this.mensajesFiltrados.filter(m => m.id !== id);
            this.calcularEstadisticas();
            this.cerrarModal();
            this.cdr.detectChanges();
            alert('Mensaje eliminado con éxito. 🗑️');
          },
          error: () => {
            alert('Hubo un problema al intentar eliminar el mensaje.');
          }
        });
    }
  }

  filtrarMensajes(event: any) {
    const termino = event.target.value.toLowerCase();
    this.paginaActual = 1;

    if (!termino) {
      this.mensajesFiltrados = [...this.mensajes];
    } else {
      this.mensajesFiltrados = this.mensajes.filter(m =>
        m.sender_name.toLowerCase().includes(termino) ||
        m.email.toLowerCase().includes(termino) ||
        m.product_interest.toLowerCase().includes(termino)
      );
    }
  }

  // 👇 CORREGIDO: Uso de acentos graves
  cambiarEstado(id: number, nuevoEstado: string) {
    this.http.put(`${environment.apiUrl}/messages/${id}/status`, { status: nuevoEstado })
      .subscribe({
        next: () => {
          const index = this.mensajes.findIndex(m => m.id === id);
          if (index !== -1) {
            this.mensajes[index].status = nuevoEstado;
          }
          this.calcularEstadisticas();
          this.cerrarModal();
          this.cdr.detectChanges();
        },
        error: () => alert('Error al actualizar estado')
      });
  }

  calcularEstadisticas() {
    this.totalMensajes = this.mensajes.length;
    this.mensajesNuevos = this.mensajes.filter(m => m.status === 'unread').length;
    this.mensajesRespondidos = this.mensajes.filter(m => m.status === 'replied').length;
  }

  get totalPaginas(): number {
    return Math.ceil(this.mensajesFiltrados.length / this.itemsPorPagina);
  }

  get mensajesMostrados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.mensajesFiltrados.slice(inicio, fin);
  }

  cambiarPagina(direccion: number) {
    this.paginaActual += direccion;
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}