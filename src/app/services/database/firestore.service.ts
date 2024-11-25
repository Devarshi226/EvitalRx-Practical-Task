import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore, arrayUnion } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth) {}

  async addPatientToUserCollection(patientId: string): Promise<void> {
    try {
      const user = await this.auth.currentUser;

      if (user) {
        const userId = user.uid;

        const patientsDocRef = this.firestore
          .collection('UserCollection')
          .doc(userId)
          .collection('patients')
          .doc('patientList');

        await patientsDocRef.set(
          {
            patientIds: arrayUnion(patientId),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Error adding patient ID:', error);
    }
  }

  async retrieveUserPatients(): Promise<string[]> {
    try {
      const user1 = await this.auth.currentUser;

      if (user1) {
        localStorage.setItem('user', JSON.stringify(user1));
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (user) {
        const userId = user.uid;

        const patientsDocRef = this.firestore
          .collection('UserCollection')
          .doc(userId)
          .collection('patients')
          .doc('patientList');

        const docSnapshot = await patientsDocRef.get().toPromise();

        if (docSnapshot?.exists) {
          const data = docSnapshot.data();
          return data?.['patientIds'] || [];
        } else {
          return [];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error retrieving patient IDs:', error);
      return [];
    }
  }

  async addOrderToUserCollection(orderId: string): Promise<void> {
    try {
      const user = await this.auth.currentUser;

      if (user) {
        const userId = user.uid;

        const ordersDocRef = this.firestore
          .collection('UserCollection')
          .doc(userId)
          .collection('orders')
          .doc('orderList');

        await ordersDocRef.set(
          {
            orderIds: arrayUnion(orderId),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Error adding order ID:', error);
    }
  }

  async retrieveUserOrders(): Promise<string[]> {
    try {
      const user1 = await this.auth.currentUser;

      if (user1) {
        localStorage.setItem('user', JSON.stringify(user1));
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (user) {
        const userId = user.uid;

        const ordersDocRef = this.firestore
          .collection('UserCollection')
          .doc(userId)
          .collection('orders')
          .doc('orderList');

        const docSnapshot = await ordersDocRef.get().toPromise();

        if (docSnapshot?.exists) {
          const data = docSnapshot.data();
          return data?.['orderIds'] || [];
        } else {
          return [];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error retrieving order IDs:', error);
      return [];
    }
  }
}

