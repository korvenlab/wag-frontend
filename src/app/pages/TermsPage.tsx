import React from 'react';

export const TermsPage = () => {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '60px auto', 
      padding: '40px 20px', 
      fontFamily: '"Inter", sans-serif',
      color: '#374151',
      lineHeight: '1.7'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '50px', borderBottom: '1px solid #e5e7eb', paddingBottom: '30px' }}>
        <img 
          src="/logo.png" 
          alt="Logo Wagoobot" 
          style={{ height: '50px', marginBottom: '20px' }} 
        />
        <h1 style={{ color: '#111827', fontSize: '2.25rem', margin: '0' }}>Termos de Serviço</h1>
        <p style={{ color: '#6b7280', marginTop: '10px' }}>Wagoobot • Um produto Korven Lab</p>
      </header>

      <section>
        <p>Última atualização: 31 de Março de 2026</p>
        
        <p>
          Bem-vindo ao <strong>Wagoobot</strong>. Ao acessar ou utilizar nosso serviço, você concorda em cumprir e estar vinculado aos seguintes Termos de Serviço operados pela <strong>Korven Lab</strong>.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>1. Aceitação dos Termos</h2>
        <p>
          Ao criar uma conta ou utilizar o Wagoobot, você concorda com estes Termos. Se você não concordar com qualquer parte dos termos, não poderá acessar o serviço.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>2. Descrição do Serviço</h2>
        <p>
          O Wagoobot fornece uma ferramenta de automação que integra o WhatsApp ao Google Calendar. O serviço utiliza inteligência artificial para processar mensagens e sincronizar agendamentos em tempo real na agenda do usuário.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>3. Assinaturas e Pagamentos</h2>
        <ul>
          <li><strong>Plano Pro:</strong> O valor da assinatura é de R$ 60,00 por mês.</li>
          <li><strong>Processamento:</strong> Todos os pagamentos são processados de forma segura via <strong>Stripe</strong>.</li>
          <li><strong>Renovação:</strong> A assinatura é renovada automaticamente a cada 30 dias.</li>
          <li><strong>Cancelamento:</strong> Pode ser solicitado a qualquer momento através do painel do usuário ou suporte, sem taxas de fidelidade.</li>
        </ul>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>4. Uso das APIs de Terceiros</h2>
        <p>
          O Wagoobot depende das APIs da <strong>Meta (WhatsApp)</strong> e do <strong>Google (Calendar)</strong>. 
          O usuário concede ao Wagoobot as permissões necessárias para ler a disponibilidade da agenda e inserir novos eventos em seu nome, estritamente para a finalidade de agendamento automático.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>5. Responsabilidades do Usuário</h2>
        <p>
          O usuário é responsável por:
          <ul style={{ marginTop: '10px' }}>
            <li>Manter a segurança de suas credenciais de acesso.</li>
            <li>Garantir que as informações de horários em sua agenda estejam corretas.</li>
            <li>Cumprir as políticas anti-spam do WhatsApp/Meta.</li>
          </ul>
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>6. Limitação de Responsabilidade</h2>
        <p>
          A Korven Lab não se responsabiliza por perdas financeiras ou conflitos de agenda decorrentes de falhas técnicas nas plataformas de terceiros (Google/Meta) ou por má configuração por parte do usuário.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>7. Foro</h2>
        <p>
          Estes termos são regidos pelas leis da República Federativa do Brasil, sendo eleito o foro da comarca de <strong>Campina Grande, PB</strong>, para dirimir quaisquer controvérsias.
        </p>
      </section>

      <footer style={{ marginTop: '80px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
        <p>© 2026 Korven Lab - Todos os direitos reservados.</p>
        <p>Campina Grande, PB - Brasil</p>
      </footer>
    </div>
  );
};
