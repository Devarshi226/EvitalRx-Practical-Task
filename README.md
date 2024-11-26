# EvitalRx - Modern Medicine Ordering Platform 💊

[EvitalRx Demo](https://evital-demo-devarshi226.netlify.app/) | [Source Code](https://github.com/Devarshi226/EvitalRx-Practical-Task)

Experience seamless online medicine ordering with **EvitalRx**, a sophisticated platform built using Angular and Firebase. Our dual-backend architecture combines a dedicated EvitalRx API for product management with Firebase for robust authentication and data persistence.

## 🎯 Core Features

- **Medicine Search**: Smart suggestions, popular medicines showcase
- **Patient Management**: Add and track multiple patients
- **Cart System**: Multi-patient orders, quantity management
- **Secure Checkout**: Address verification, order confirmation
- **Order History**: View past orders (Static UI - API Integration WIP)

## 🏗️ Technical Architecture

### Dual Backend System
1. **EvitalRx API**
   - Product catalog management
   - Patient data handling
   - Order processing
   - Checkout flow

2. **Firebase Backend**
   - User authentication
   - Patient ID storage
   - Order tracking
   - Real-time data sync

## 💻 Platform Walkthrough

### 1. Authentication
![Login](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/login.png)
![Register](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/createaccount.png)
![Forgot Password](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/resetpass.png)

- Email/password authentication
- Password recovery system
- Route guards for security

### 2. Dashboard & Search
![Dashboard](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/dashboard.png)
![Search Results](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/search1.png)
![Search Results](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/searchdoyoumean.png)
![Search Results](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/searchlist.png)
![Search Results](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/viewmedicinedetails.png)


- Dynamic search suggestions
- Swiper banners
- Popular medicines showcase
- Category filtering
- Medicine details view

### 3. Patient Management
![Add Patient](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/addpatient.png)

- Patient history tracking
- Multiple patients per user
- Firebase data persistence

### 4. Cart Management
![Cart](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/cart.png)

- Add/remove medicines
- Quantity adjustment
- Patient assignment
- Price calculations

### 5. Checkout Process
![Checkout](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/checkout.png)
![Order Confirmation](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/orderConfirmation.png)

- Address validation
- Order review
- Patient verification
- Confirmation system

### 6. Order History (In Development)
![Order History](https://github.com/Devarshi226/EvitalRx-Practical-Task/blob/cd29ddae9213d7554cd53b8116bc6a1f01a7e3d5/src/assets/screenShorts/past-order%20concept.png)

- View past orders
- Track order status
- Download invoices
- **Note**: Currently displaying static UI, API integration pending

## 🛠️ Technical Features

### Performance Optimization
```typescript
// Lazy Loading Example
const routes: Routes = [
  {
    path: 'pages',
    loadChildren: () => import('./pages/pages.module')
      .then(m => m.PagesModule)
  }
];
```

### Data Management
```typescript
// Dual Backend Integration
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(
    private evitalApi: EvitalApiService,
    private firestore: AngularFirestore
  ) {}

  async getProductDetails(id: string) {
    const product = await this.evitalApi.getProduct(id);
    const analytics = await this.firestore
      .collection('products')
      .doc(id)
      .get()
      .toPromise();
    
    return { ...product, ...analytics };
  }
}
```

## 🚀 Getting Started

1. **Clone Repository**
   ```bash
   git clone https://github.com/Devarshi226/EvitalRx-Practical-Task
   cd EvitalRx-Practical-Task
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Create environment.ts
   export const environment = {
     production: false,
     firebaseConfig: {
       // Your Firebase credentials
     },
     evitalApiKey: 'evital_Api'
   };
   ```

4. **Run Development Server**
   ```bash
   ng serve
   ```

## ⚙️ Technical Requirements

- Node.js 20+
- Angular CLI 15+
- Firebase Account
- EvitalRx API Access

## ⚠️ Important Notes

- Patient registration required before checkout
- Firebase setup needed for authentication
- Internet connection required for real-time features
- Order tracking API integration pending

## 🔒 Security Features

- Route guards
- Data encryption
- Role-based access
- Secure API endpoints

## 📱 Responsive Design

- Mobile-first approach
- Material Design components
- Adaptive layouts
- Cross-browser compatibility

## 🔄 State Management

- RxJS Observables
- Firebase Database
- Local Storage backup
- Session management

## 📞 Support

- Create issues on GitHub

## 📄 License

MIT License - See [LICENSE](license-link) file

---

<!-- ### Firebase Collections Structure
![Firebase Structure](your-firebase-structure-image) -->

```
users/
  ├── userId/
  │   ├── profile
  │   ├── patients/
  │   │   └── patientList
  │   └── orders/
  │       └── orderHistory
  └── ...
```

---
