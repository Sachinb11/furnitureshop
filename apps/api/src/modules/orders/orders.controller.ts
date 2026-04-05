import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OrderStatus } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private svc: OrdersService) {}
  @Post() @ApiOperation({ summary: 'Place order' })
  create(@CurrentUser() user: User, @Body() dto: any) { return this.svc.create(user.id, dto); }
  @Get() @ApiOperation({ summary: 'My orders' })
  findMine(@CurrentUser() user: User, @Query('page') page = 1, @Query('limit') limit = 10) { return this.svc.findUserOrders(user.id, +page, +limit); }
  @Get(':id') findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) { return this.svc.findOne(id, user.id); }
  @Patch(':id/status') @UseGuards(RolesGuard) @Roles('admin','super_admin')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: OrderStatus) { return this.svc.updateStatus(id, status); }
}
