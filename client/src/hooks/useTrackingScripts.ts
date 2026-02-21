import { useEffect } from 'react';

/**
 * Hook to inject marketing tracking scripts (Meta Pixel, GA4, GTM)
 * into the <head> and <body> of the Landing Page.
 * 
 * Scripts are only injected when the corresponding ID is provided.
 * On unmount, all injected scripts are cleaned up.
 */
export function useTrackingScripts(options: {
  metaPixelId?: string | null;
  ga4MeasurementId?: string | null;
  gtmContainerId?: string | null;
}) {
  const { metaPixelId, ga4MeasurementId, gtmContainerId } = options;

  // Meta Pixel (Facebook)
  useEffect(() => {
    if (!metaPixelId) return;

    const scriptId = 'meta-pixel-script';
    const noscriptId = 'meta-pixel-noscript';

    // Avoid duplicate injection
    if (document.getElementById(scriptId)) return;

    // Inject Meta Pixel base code into <head>
    const script = document.createElement('script');
    script.id = scriptId;
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${metaPixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Inject noscript fallback into <body>
    const noscript = document.createElement('noscript');
    noscript.id = noscriptId;
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1"/>`;
    document.body.appendChild(noscript);

    return () => {
      document.getElementById(scriptId)?.remove();
      document.getElementById(noscriptId)?.remove();
      // Clean up fbq from window
      if ((window as any).fbq) {
        delete (window as any).fbq;
        delete (window as any)._fbq;
      }
    };
  }, [metaPixelId]);

  // Google Analytics 4 (GA4)
  useEffect(() => {
    if (!ga4MeasurementId) return;

    const gtagScriptId = 'ga4-gtag-script';
    const gtagConfigId = 'ga4-config-script';

    // Avoid duplicate injection
    if (document.getElementById(gtagScriptId)) return;

    // Inject gtag.js library
    const gtagScript = document.createElement('script');
    gtagScript.id = gtagScriptId;
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`;
    document.head.appendChild(gtagScript);

    // Inject gtag configuration
    const configScript = document.createElement('script');
    configScript.id = gtagConfigId;
    configScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${ga4MeasurementId}');
    `;
    document.head.appendChild(configScript);

    return () => {
      document.getElementById(gtagScriptId)?.remove();
      document.getElementById(gtagConfigId)?.remove();
    };
  }, [ga4MeasurementId]);

  // Google Tag Manager (GTM)
  useEffect(() => {
    if (!gtmContainerId) return;

    const gtmScriptId = 'gtm-head-script';
    const gtmNoscriptId = 'gtm-body-noscript';

    // Avoid duplicate injection
    if (document.getElementById(gtmScriptId)) return;

    // Inject GTM script into <head>
    const headScript = document.createElement('script');
    headScript.id = gtmScriptId;
    headScript.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmContainerId}');
    `;
    document.head.appendChild(headScript);

    // Inject GTM noscript iframe into <body>
    const noscript = document.createElement('noscript');
    noscript.id = gtmNoscriptId;
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmContainerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscript, document.body.firstChild);

    return () => {
      document.getElementById(gtmScriptId)?.remove();
      document.getElementById(gtmNoscriptId)?.remove();
    };
  }, [gtmContainerId]);
}
