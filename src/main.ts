import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import { register as registerSwiperElement } from 'swiper/element/bundle';

registerSwiperElement();


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
