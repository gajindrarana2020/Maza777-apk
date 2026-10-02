import React from 'react';

export const AdsterraBannerAd: React.FC = () => {
  const adHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            background: transparent; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            overflow: hidden; 
            width: 320px; 
            height: 50px; 
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : 'c88ecf17b1da2f86f2edb4ca75b93deb',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highrevenueformat.com/c88ecf17b1da2f86f2edb4ca75b93deb/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className="w-full flex items-center justify-center my-2">
      <div className="w-[320px] h-[50px] overflow-hidden flex items-center justify-center">
        <iframe
          srcDoc={adHtml}
          width="320"
          height="50"
          title="Adsterra Banner"
          scrolling="no"
          style={{ border: 'none', overflow: 'hidden', display: 'block' }}
        />
      </div>
    </div>
  );
};
