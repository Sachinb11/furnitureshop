import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get('me') @ApiOperation({ summary: 'Get my profile' })
  getMe(@CurrentUser() user: User) { return user; }

  @Patch('me') @ApiOperation({ summary: 'Update my profile' })
  updateMe(@CurrentUser() user: User, @Body() dto: Partial<User>) { return this.svc.update(user.id, dto); }

  @Get('me/addresses') getAddresses(@CurrentUser() user: User) { return this.svc.getAddresses(user.id); }

  @Post('me/addresses') createAddress(@CurrentUser() user: User, @Body() dto: any) { return this.svc.createAddress(user.id, dto); }

  @Patch('me/addresses/:id') updateAddress(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.svc.updateAddress(user.id, id, dto);
  }

  @Delete('me/addresses/:id') deleteAddress(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.deleteAddress(user.id, id);
  }

  @Get() @UseGuards(RolesGuard) @Roles('admin','super_admin') @ApiOperation({ summary: '[Admin] List all users' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) { return this.svc.findAll(+page, +limit); }
}
