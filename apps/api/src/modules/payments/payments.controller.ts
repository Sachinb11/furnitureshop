import { Controller, Post, Body, Param, UseGuards, Headers, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private svc: PaymentsService) {}

  @Post('initiate/:orderId') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Razorpay order' })
  initiate(@Param('orderId') orderId: string, @CurrentUser() user: User) { return this.svc.initiate(orderId, user.id); }

  @Post('verify') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify payment' })
  verify(@Body() body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    return this.svc.verify(body.razorpayOrderId, body.razorpayPaymentId, body.razorpaySignature);
  }

  @Post('webhook') @ApiOperation({ summary: 'Razorpay webhook' })
  webhook(@Req() req: any, @Headers('x-razorpay-signature') sig: string) { return this.svc.handleWebhook(req.body, sig); }
}
