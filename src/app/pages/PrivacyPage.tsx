import React from 'react';

export const PrivacyPage = () => {
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
        <h1 style={{ color: '#111827', fontSize: '2.25rem', margin: '0' }}>Política de Privacidade</h1>
        <p style={{ color: '#6b7280', marginTop: '10px' }}>Wagoo • Um produto Korven Lab</p>
      </header>

      <section>
        <p style={{ fontWeight: '500' }}>Última atualização: 31 de Março de 2026</p>
        <p>
          A <strong>Korven Lab</strong> ("nós", "nosso") opera o Wagoo. Esta página informa você sobre nossas políticas relativas à coleta, uso e divulgação de dados pessoais quando você usa nosso Serviço e as escolhas que você tem associadas a esses dados.
        </p>

        {/* Bloco de Destaque para o Auditor do Google */}
        <div style={{ 
          background: '#eff6ff', 
          border: '1px solid #dbeafe', 
          padding: '25px', 
          borderRadius: '12px', 
          margin: '30px 0',
          color: '#1e40af'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Conformidade com APIs do Google</h3>
          <p style={{ margin: '0', fontSize: '0.95rem' }}>
            O uso e a transferência de informações recebidas das APIs do Google pelo Wagoo para qualquer outro aplicativo estarão em conformidade com a 
            <a 
              href="https://developers.google.com/terms/api-services-user-data-policy" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#2563eb', fontWeight: '600', marginLeft: '5px' }}
            >
              Política de Dados do Usuário dos Serviços de API do Google
            </a>, incluindo os requisitos de <strong>Uso Limitado</strong>.
          </p>
        </div>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>1. Coleta e Uso de Informações</h2>
        <p>Coletamos vários tipos diferentes de informações para diversos fins, visando fornecer e melhorar nosso Serviço para você.</p>
        
        <h3 style={{ color: '#111827' }}>Dados de Uso do Google Calendar</h3>
        <p>
          O Wagoo solicita acesso ao seu Google Calendar para:
        </p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Ler eventos existentes para identificar horários ocupados.</li>
          <li>Inserir novos eventos de agendamento confirmados via WhatsApp.</li>
          <li>Atualizar ou deletar eventos caso você cancele um agendamento pelo nosso painel.</li>
        </ul>

        <h3 style={{ color: '#111827' }}>Dados de Mensagens (WhatsApp)</h3>
        <p>
          Processamos o conteúdo das mensagens recebidas em seu número conectado apenas para identificar intenções de agendamento (nomes, datas e horários). Não armazenamos o histórico completo de suas conversas privadas.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>2. Segurança de Dados</h2>
        <p>
          A segurança dos seus dados é importante para nós. Utilizamos autenticação via OAuth2, o que significa que o Wagoo nunca armazena sua senha do Google. Os tokens de acesso são criptografados e armazenados em ambiente seguro.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>3. Seus Direitos (LGPD)</h2>
        <p>
          Como usuário, você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você pode revogar o acesso do Wagoo à sua conta Google a qualquer momento através das configurações de segurança da sua Conta Google ou entrando em contato conosco.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>4. Alterações nesta Política</h2>
        <p>
          Podemos atualizar nossa Política de Privacidade de tempos em tempos. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página.
        </p>
      </section>

      <footer style={{ marginTop: '80px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
        <p>© 2026 Korven Lab - Todos os direitos reservados.</p>
        <p>Campina Grande, PB - Brasil</p>
      </footer>
    </div>
  );
};
