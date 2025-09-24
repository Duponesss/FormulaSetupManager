import { useRef, useCallback } from 'react';

/**
 * Um hook personalizado para prevenir múltiplos toques rápidos (debounce).
 * @param callback A função a ser executada.
 * @param delay O tempo em milissegundos para ignorar toques subsequentes. O padrão é 1000ms (1 segundo).
 * @returns Uma versão "debounced" da função de callback.
 */

export const useSingleTap = (callback: (...args: any[]) => void, delay: number = 1000) => {
  // useRef em vez de useState para não causar re-renderizações desnecessárias.
  const processing = useRef(false);

  // useCallback para garantir que a função retornada seja estável entre renderizações.
  const debouncedCallback = useCallback((...args: any[]) => {
    // Se a ação já estiver em processamento, ignora o novo clique.
    if (processing.current) {
      console.log('Clique rápido ignorado.');
      return;
    }

    // Marca como "em processamento".
    processing.current = true;
    
    // Executa a função original.
    callback(...args);

    // Após o delay, liberta o bloqueio.
    setTimeout(() => {
      processing.current = false;
    }, delay);

  }, [callback, delay]);

  return debouncedCallback;
};