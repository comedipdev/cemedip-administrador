import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [UpperCasePipe],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly user = inject(AuthService).currentUser;
}
