import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import type { ZodType, ZodTypeDef } from "zod";

@Injectable()
export class ZodPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T, ZodTypeDef, unknown>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }
    return result.data;
  }
}
