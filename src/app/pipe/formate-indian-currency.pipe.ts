import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formateIndianCurrency'
})
export class FormateIndianCurrencyPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
