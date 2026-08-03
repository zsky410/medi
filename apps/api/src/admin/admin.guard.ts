import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { JwtUser } from "../common/current-user.decorator";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: JwtUser }>();
    if (request.user?.role === "ADMIN") return true;
    throw new ForbiddenException("Bạn không có quyền truy cập trang quản trị");
  }
}
