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
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { SkeletonFieldComponent } from '@shared/components/skeleton-field/skeleton-field';
import { SeguridadService } from '@core/services/seguridad.service';
import { ToastService } from '@core/services/toast.service';
import { extractApiErrorMessage } from '@core/models/api.model';
import { EstudianteCreateInput, EstudianteDetalle } from '@core/models/seguridad.model';

@Component({
  selector: 'app-estudiante-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    DatePickerModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    SkeletonFieldComponent,
  ],
  templateUrl: './estudiante-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstudianteFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seguridadService = inject(SeguridadService);
  private toast = inject(ToastService);

  protected readonly tipoIdentificacionOpciones = [
    { label: 'Cédula', value: 'cedula' },
    { label: 'Pasaporte', value: 'pasaporte' },
  ];

  protected readonly generoOpciones = [
    { label: 'Masculino', value: 'Masculino' },
    { label: 'Femenino', value: 'Femenino' },
    { label: 'Otro', value: 'Otro' },
  ];

  protected readonly idEstudiante = signal<number | null>(null);
  protected readonly estudiante = signal<EstudianteDetalle | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isToggling = signal(false);

  protected readonly esNuevo = computed(() => this.idEstudiante() === null);
  protected readonly isActive = computed(() => this.estudiante()?.is_active ?? true);
  protected readonly formSubmitted = signal(false);
  protected readonly usernameDisplay = signal('');

  protected readonly skeletonFields = Array.from({ length: 10 });

  protected ctrl(name: string) {
    return this.form.get(name)!;
  }

  protected fieldInvalid(name: string): boolean {
    const c = this.ctrl(name);
    return c.invalid && (c.touched || c.dirty || this.formSubmitted());
  }

  protected readonly form = this.fb.group({
    tipo_identificacion: ['cedula'],
    identificacion: [''],
    nombres: [''],
    apellidos: [''],
    correo_institucional: ['', [Validators.required, Validators.email]],
    correo_personal: [''],
    telefono_convencional: [''],
    telefono_celular: [''],
    direccion: [''],
    fecha_nacimiento: [null as Date | null],
    genero: [null as string | null],
    username: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idEstudiante.set(+id);
      this.cargarEstudiante(+id);
    }
    this.form.get('username')!.valueChanges.subscribe(v => this.usernameDisplay.set(v ?? ''));
  }

  private cargarEstudiante(id: number) {
    this.isLoading.set(true);
    this.seguridadService.getEstudiante(id).subscribe({
      next: (res) => {
        const e = res.data;
        this.estudiante.set(e);
        this.usernameDisplay.set(e.username);
        this.form.patchValue({
          tipo_identificacion: e.tipo_identificacion ?? 'cedula',
          identificacion: e.identificacion ?? '',
          nombres: e.nombres ?? '',
          apellidos: e.apellidos ?? '',
          correo_institucional: e.correo_institucional,
          correo_personal: e.correo_personal ?? '',
          telefono_convencional: e.telefono_convencional ?? '',
          telefono_celular: e.telefono_celular ?? '',
          direccion: e.direccion ?? '',
          fecha_nacimiento: e.fecha_nacimiento ? new Date(e.fecha_nacimiento) : null,
          genero: e.genero ?? null,
          username: e.username,
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
    const id = this.idEstudiante();

    const payload = {
      tipo_identificacion: raw.tipo_identificacion || null,
      identificacion: raw.identificacion || null,
      nombres: raw.nombres || null,
      apellidos: raw.apellidos || null,
      correo_personal: raw.correo_personal || null,
      telefono_convencional: raw.telefono_convencional || null,
      telefono_celular: raw.telefono_celular || null,
      direccion: raw.direccion || null,
      fecha_nacimiento: raw.fecha_nacimiento ? this.formatDate(raw.fecha_nacimiento) : null,
      genero: raw.genero || null,
      // correo_institucional solo al crear (se convierte en username)
      ...(id === null
        ? { correo_institucional: raw.correo_institucional }
        : { username: raw.username || null }),
    };

    const req = id
      ? this.seguridadService.actualizarEstudiante(id, payload)
      : this.seguridadService.crearEstudiante(payload as EstudianteCreateInput);

    req.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (!id) {
          this.toast.success('Estudiante creado correctamente.');
          this.router.navigate(['/seguridad/estudiantes', res.data.id_estudiante]);
        } else {
          this.estudiante.set(res.data);
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
    const id = this.idEstudiante();
    if (!id || this.isToggling()) return;
    this.isToggling.set(true);

    const activo = this.isActive();
    const req = activo
      ? this.seguridadService.inactivarEstudiante(id)
      : this.seguridadService.activarEstudiante(id);

    req.subscribe({
      next: () => {
        this.estudiante.update((e) => (e ? { ...e, is_active: !activo } : e));
        this.toast.success(activo ? 'Estudiante desactivado.' : 'Estudiante activado.');
        this.isToggling.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isToggling.set(false);
      },
    });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
