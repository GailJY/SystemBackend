import { Column, CreateDateColumn, PrimaryGeneratedColumn , UpdateDateColumn ,Entity } from 'typeorm';


@Entity({
    name: 'permission'
})

export class Permission{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 20,
        comment: '权限名称'
    })
    code: string;

    @Column({
        length: 100,
        comment: '权限描述'
    })
    description: string;
}

