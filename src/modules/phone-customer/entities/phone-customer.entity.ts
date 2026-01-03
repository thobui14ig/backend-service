import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('customer_phones')
export class PhoneCustomerEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "phone_number" })
    phoneNumber: string;

    @Column({ name: "is_click" })
    isClick: boolean;
}
