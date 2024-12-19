import { Column, CreateDateColumn, PrimaryGeneratedColumn, JoinTable, ManyToMany, UpdateDateColumn ,Entity } from 'typeorm';
import { Permission } from "./permission.entity";


@Entity({
    name: 'roles'
})

export class Role{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 20,
        comment: '角色名称'
    })
    name: string;

    @ManyToMany(() => Permission)
    @JoinTable({
        name: 'role_permission'
    })
    permissions: Permission[];
}