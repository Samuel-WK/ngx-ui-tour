import {Injectable} from '@angular/core';
import type {PrimeNgStepOption} from './step-option.interface';
import {TourService} from 'ngx-ui-tour-core';

@Injectable({
    providedIn: 'root'
})
export class PrimeNgTourService<T extends PrimeNgStepOption = PrimeNgStepOption> extends TourService<T> {
}
