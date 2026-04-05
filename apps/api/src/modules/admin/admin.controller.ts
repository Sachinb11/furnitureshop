import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@SkipThrottle()
@Controller('admin')
export class AdminController {
  constructor(private svc: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  getDashboard() { return this.svc.getDashboard(); }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders (admin)' })
  getAllOrders(@Query() filters: any) { return this.svc.getAllOrders(filters); }

  @Get('products')
  @ApiOperation({ summary: 'Get all products (admin)' })
  getAllProducts(@Query() filters: any) { return this.svc.getAllProducts(filters); }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin)' })
  getAllUsers(@Query() filters: any) { return this.svc.getAllUsers(filters); }
}
