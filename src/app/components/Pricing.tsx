import express, { Request, Response } from 'express';
import Stripe from 'stripe';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // @ts-ignore
});

router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const { email, userId } = req.body;
    const priceId = process.env.STRIPE_PRICE_ID;
    
    // 1. Verificação da URL do Frontend
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl || !frontendUrl.startsWith('http')) {
      console.error("❌ ERRO: FRONTEND_URL inválida ou ausente no .env do Backend.");
      return res.status(500).json({ error: "Configuração de URL do servidor inválida." });
    }

    if (!priceId) {
      return res.status(500).json({ error: "STRIPE_PRICE_ID não configurado." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      customer_email: email,
      client_reference_id: userId,
      // 2. Garantindo que a URL seja construída corretamente
      success_url: `${frontendUrl}/dashboard?success=true`,
      cancel_url: `${frontendUrl}/pricing`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("🔥 Erro Stripe:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ... (Restante do código do Webhook permanece igual)
export default router;
