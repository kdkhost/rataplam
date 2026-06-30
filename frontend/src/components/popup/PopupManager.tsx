'use client';

import { useState, useEffect } from 'react';
import PopupPromocao from './PopupPromocao';
import PopupBlackFriday from './PopupBlackFriday';
import PopupSaida from './PopupSaida';

interface Config {
  popup_promocao_ativo?: boolean;
  popup_promocao_titulo?: string;
  popup_promocao_subtitulo?: string;
  popup_promocao_desconto?: string;
  popup_promocao_imagem?: string;
  popup_promocao_data_fim?: string;
  popup_black_friday_ativo?: boolean;
  popup_black_friday_titulo?: string;
  popup_black_friday_subtitulo?: string;
  popup_black_friday_desconto?: string;
  popup_black_friday_imagem?: string;
  popup_black_friday_data_fim?: string;
  popup_saida_ativo?: boolean;
}

export default function PopupManager() {
  const [config, setConfig] = useState<Config>({});
  const [dismissed, setDismissed] = useState({ promo: false, blackFriday: false, saida: false });
  const [activePopup, setActivePopup] = useState<'promo' | 'blackFriday' | 'saida' | null>(null);

  useEffect(() => {
    fetch('/api/admin/configuracoes')
      .then((res) => res.json())
      .then((data) => {
        const cfg = data.configuracoes || data || {};
        setConfig(cfg);

        if (cfg.popup_black_friday_ativo && !localStorage.getItem('popup_blackfriday_dismissed')) {
          setActivePopup('blackFriday');
        } else if (cfg.popup_promocao_ativo && !localStorage.getItem('popup_promocao_dismissed')) {
          setActivePopup('promo');
        } else if (cfg.popup_saida_ativo !== false) {
          setActivePopup('saida');
        }
      })
      .catch(() => {
        setActivePopup('saida');
      });
  }, []);

  const handleDismissPromo = () => {
    setDismissed((prev) => ({ ...prev, promo: true }));
    if (config.popup_saida_ativo !== false) {
      setActivePopup('saida');
    } else {
      setActivePopup(null);
    }
  };

  const handleDismissBlackFriday = () => {
    setDismissed((prev) => ({ ...prev, blackFriday: true }));
    if (config.popup_promocao_ativo && !localStorage.getItem('popup_promocao_dismissed')) {
      setActivePopup('promo');
    } else if (config.popup_saida_ativo !== false) {
      setActivePopup('saida');
    } else {
      setActivePopup(null);
    }
  };

  const handleDismissSaida = () => {
    setDismissed((prev) => ({ ...prev, saida: true }));
    setActivePopup(null);
  };

  return (
    <>
      {activePopup === 'blackFriday' && !dismissed.blackFriday && (
        <PopupBlackFriday config={config as any} onDismiss={handleDismissBlackFriday} />
      )}
      {activePopup === 'promo' && !dismissed.promo && (
        <PopupPromocao config={config as any} onDismiss={handleDismissPromo} />
      )}
      {activePopup === 'saida' && !dismissed.saida && (
        <PopupSaida onDismiss={handleDismissSaida} />
      )}
    </>
  );
}
