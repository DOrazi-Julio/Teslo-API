import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Type(()=> Number) // Esto seria igual que poner enableImplicitConversions: true en el objeto de configuración general en el main como se hizo con pokeAPI
    limit?:number;
    @IsOptional()
    @Min(0)
    @Type(()=> Number)
    offset?: number;
}