import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OperacionesService } from '../../services/operaciones';

@Component({
    selector: 'app-operaciones-faja',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './operaciones-faja.html'
})
export class OperacionesFajaComponent implements OnInit {

    loteActivo: any = null;
    cargando = true;

    // Formulario en vivo
    categoriaSeleccionada: string = '';
    pesoIngresado: number | null = null;
    guardando = false;

    constructor(private api: OperacionesService) { }

    ngOnInit(): void {
        this.cargarLoteActivo();
    }

    cargarLoteActivo() {
        this.api.getLoteActivo().subscribe({
            next: (res: any) => {
                this.loteActivo = res.lote;
                this.cargando = false;
            },
            error: () => {
                this.loteActivo = null;
                this.cargando = false;
            }
        });
    }

    seleccionarCategoria(cat: string) {
        this.categoriaSeleccionada = cat;
    }

    guardarPesaje() {
        if (!this.categoriaSeleccionada) {
            Swal.fire('Atención', 'Selecciona una categoría primero (Primera, Partida u Ojos)', 'warning');
            return;
        }
        if (!this.pesoIngresado || this.pesoIngresado <= 0) {
            Swal.fire('Atención', 'Ingresa un peso válido', 'warning');
            return;
        }

        this.guardando = true;
        const data = {
            lote_id: this.loteActivo.id,
            categoria: this.categoriaSeleccionada,
            peso: this.pesoIngresado
        };

        this.api.registrarPesaje(data).subscribe({
            next: () => {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registrado!',
                    text: `${this.pesoIngresado}kg de ${this.categoriaSeleccionada}`,
                    timer: 1500,
                    showConfirmButton: false
                });
                // Resetear para el siguiente saco
                this.pesoIngresado = null;
                this.categoriaSeleccionada = '';
                this.guardando = false;
            },
            error: () => {
                Swal.fire('Error', 'Hubo un problema al registrar el peso', 'error');
                this.guardando = false;
            }
        });
    }
}