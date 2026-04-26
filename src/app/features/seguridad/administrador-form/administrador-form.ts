import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonFieldComponent } from '@shared/components/skeleton-field/skeleton-field';
import { SeguridadService } from '@core/services/seguridad.service';
import { ToastService } from '@core/services/toast.service';
import { extractApiErrorMessage } from '@core/models/api.model';
import { AdministradorDetalle } from '@core/models/seguridad.model';

@Component({
  selector: 'app-administrador-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    SkeletonFieldComponent,
  ],
  templateUrl: './administrador-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdministradorFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seguridadService = inject(SeguridadService);
  private toast = inject(ToastService);

  protected readonly idAdministrador = signal<number | null>(null);
  protected readonly administrador = signal<AdministradorDetalle | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isToggling = signal(false);
  protected readonly formSubmitted = signal(false);

  protected readonly esNuevo = computed(() => this.idAdministrador() === null);
  protected readonly isActive = computed(() => this.administrador()?.is_active ?? true);

  protected readonly skeletonFields = Array.from({ length: 2 });

  protected ctrl(name: string) {
    return this.form.get(name)!;
  }

  protected fieldInvalid(name: string): boolean {
    const c = this.ctrl(name);
    return c.invalid && (c.touched || c.dirty || this.formSubmitted());
  }

  protected readonly form = this.fb.group({
    nombre: [''],
    username: ['', [Validators.required]],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idAdministrador.set(+id);
      this.cargarAdministrador(+id);
    }
  }

  private cargarAdministrador(id: number) {
    this.isLoading.set(true);
    this.seguridadService.getAdministrador(id).subscribe({
      next: (res) => {
        const a = res.data;
        this.administrador.set(a);
        this.form.patchValue({
          nombre: a.nombre ?? '',
          username: a.username,
        });
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isLoading.set(false);
      },
    });
  }

  guardar() {
    this.formSubmitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSaving()) return;
    this.isSaving.set(true);

    const raw = this.form.getRawValue();
    const id = this.idAdministrador();

    const payload = {
      nombre: raw.nombre || null,
      username: raw.username,
    };

    const req = id
      ? this.seguridadService.actualizarAdministrador(id, payload)
      : this.seguridadService.crearAdministrador(payload);

    req.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (!id) {
          this.toast.success('Administrador creado. Se enviará un correo con las credenciales de acceso.');
          this.router.navigate(['/seguridad/administradores', res.data.id_administrador]);
        } else {
          this.administrador.set(res.data);
          this.toast.success('Datos guardados correctamente.');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isSaving.set(false);
      },
    });
  }

  toggleActivo() {
    const id = this.idAdministrador();
    if (!id || this.isToggling()) return;
    this.isToggling.set(true);

    const activo = this.isActive();
    const req = activo
      ? this.seguridadService.inactivarAdministrador(id)
      : this.seguridadService.activarAdministrador(id);

    req.subscribe({
      next: () => {
        this.administrador.update((a) => (a ? { ...a, is_active: !activo } : a));
        this.toast.success(activo ? 'Administrador desactivado.' : 'Administrador activado.');
        this.isToggling.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isToggling.set(false);
      },
    });
  }
}
