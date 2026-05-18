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
      {/* Header Centralizado com Logo Clicável */}
      <header style={{ textAlign: 'center', marginBottom: '50px', borderBottom: '1px solid #e5e7eb', paddingBottom: '30px' }}>
        <a 
          href="https://wagoobot.com" 
          style={{ display: 'inline-block', textDecoration: 'none' }}
          title="Ir para Home"
        >
          <img 
            src="/logo.png" 
            alt="Logo Wagoo" 
            style={{ height: '60px', marginBottom: '20px', cursor: 'pointer' }} 
          />
        </a>
        <h1 style={{ color: '#111827', fontSize: '2.25rem', margin: '0' }}>Termos de Serviço</h1>
        <p style={{ color: '#6b7280', marginTop: '10px' }}>Wagoo • Um produto Korven Lab</p>
      </header>

      <section>
        <p style={{ fontWeight: '500' }}>Última atualização: 31 de Março de 2026</p>
        
        <p>
          Bem-vindo ao <strong>Wagoo</strong>. Ao acessar ou utilizar nosso serviço, você concorda em cumprir e estar vinculado aos seguintes Termos de Serviço operados pela <strong>Korven Lab</strong>.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>1. Aceitação dos Termos</h2>
        <p>
          Ao criar uma conta ou utilizar o Wagoo, você concorda com estes Termos. Se você não concordar com qualquer parte dos termos, não poderá acessar o serviço.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>2. Descrição do Serviço</h2>
        <p>
          O Wagoo fornece uma ferramenta de automação que integra o WhatsApp ao Google Calendar. O serviço utiliza inteligência artificial para processar mensagens e sincronizar agendamentos em tempo real na agenda do usuário.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>3. Assinaturas e Pagamentos</h2>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Basic:</strong> R$ 59,00/mês — 1 usuário.</li>
          <li><strong>Pro:</strong> R$ 149,00/mês — até 3 usuários.</li>
          <li><strong>Pro+:</strong> R$ 259,00/mês — até 5 usuários.</li>
          <li><strong>Processamento:</strong> Todos os pagamentos são processados de forma segura via <strong>Stripe</strong>.</li>
          <li><strong>Renovação:</strong> A assinatura é renovada automaticamente a cada 30 dias.</li>
          <li><strong>Cancelamento:</strong> Pode ser solicitado a qualquer momento através do painel do usuário ou suporte, sem taxas de fidelidade.</li>
        </ul>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>4. Uso das APIs de Terceiros</h2>
        <p>
          O Wagoo depende das APIs da <strong>Meta (WhatsApp)</strong> e do <strong>Google (Calendar)</strong>. 
          O usuário concede ao Wagoo as permissões necessárias para ler a disponibilidade da agenda e inserir novos eventos em seu nome, estritamente para a finalidade de agendamento automático.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>5. Responsabilidades do Usuário</h2>
        <p>
          O usuário é responsável por:
        </p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Manter a segurança de suas credenciais de acesso.</li>
          <li>Garantir que as informações de horários em sua agenda estejam corretas.</li>
          <li>Cumprir as políticas anti-spam do WhatsApp/Meta.</li>
        </ul>

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
