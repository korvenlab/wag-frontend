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
        <p style={{ fontWeight: '500' }}>Última atualização: 06 de Abril de 2026</p>
        <p>
          A <strong>Korven Lab</strong> ("nós", "nosso") opera o Wagoo. Esta página descreve nossas políticas de coleta, uso e divulgação de dados pessoais ao utilizar nosso Serviço.
        </p>

        {/* Bloco de Conformidade Google */}
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          padding: '25px', 
          borderRadius: '12px', 
          margin: '30px 0',
          color: '#0369a1'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Conformidade com APIs do Google</h3>
          <p style={{ margin: '0', fontSize: '0.95rem' }}>
            O uso e a transferência de informações recebidas das APIs do Google pelo Wagoo para qualquer outro aplicativo estarão em conformidade com a 
            <a 
              href="https://developers.google.com/terms/api-services-user-data-policy" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#0284c7', fontWeight: '600', marginLeft: '5px' }}
            >
              Política de Dados do Usuário dos Serviços de API do Google
            </a>, incluindo os requisitos de <strong>Uso Limitado</strong>.
          </p>
        </div>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>1. Coleta e Uso de Informações</h2>
        <p>Coletamos dados para automatizar o gerenciamento de agendas entre WhatsApp e Google Calendar.</p>
        
        <h3 style={{ color: '#111827' }}>Dados do Google Calendar</h3>
        <p>
          O Wagoo acessa sua agenda apenas para:
        </p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Verificar disponibilidade de horários.</li>
          <li>Criar, editar ou remover eventos de agendamento solicitados via WhatsApp.</li>
        </ul>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>2. Compartilhamento e Transferência de Dados</h2>
        <p><strong>Nós não vendemos seus dados do Google a terceiros.</strong></p>
        <p>Para o funcionamento do serviço, os dados são processados da seguinte forma:</p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li><strong>Provedores de IA (Google Gemini API):</strong> Fragmentos de texto das mensagens recebidas são processados via API para extrair datas e intenções. De acordo com os termos da Google Cloud, esses dados não são utilizados para treinar modelos base.</li>
          <li><strong>Infraestrutura:</strong> Dados técnicos de sessão são armazenados de forma criptografada em servidores seguros.</li>
        </ul>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>3. Retenção de Dados</h2>
        <p>
          Mantemos os dados apenas enquanto sua conta estiver ativa. Ao desconectar sua conta Google, os tokens de acesso são imediatamente revogados e deletados de nossa base.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>4. Segurança</h2>
        <p>
          Implementamos autenticação via <strong>OAuth2</strong>. Seus dados são protegidos por criptografia em trânsito (TLS) e em repouso.
        </p>

        <h2 style={{ color: '#111827', marginTop: '40px' }}>5. Direitos do Usuário</h2>
        <p>
          Você pode solicitar a exclusão de seus dados ou revogar acessos a qualquer momento através do e-mail suporte@korvenlab.com ou pelas configurações de segurança da sua conta Google.
        </p>
      </section>

      <footer style={{ marginTop: '80px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
        <p>© 2026 Korven Lab - Todos os direitos reservados.</p>
        <p>Campina Grande, PB - Brasil</p>
      </footer>
    </div>
  );
};
