export type HttpError = {
  name: string;
  message: string;
  code: number;
  stack?: string;
  _httpError: string;
};

export const isHttpError = (error: unknown): error is HttpError => {
  return typeof error === 'object' && null !== error && typeof (error as HttpError)._httpError === 'string';
};

export const createBadRequest = (message: string): HttpError => ({
  name: 'Bad Request',
  message,
  code: 400,
  _httpError: 'BadRequest',
});

export const createUnauthorized = (message: string): HttpError => ({
  name: 'Unauthorized',
  message,
  code: 401,
  _httpError: 'Unauthorized',
});

export const createForbidden = (message: string): HttpError => ({
  name: 'Forbidden',
  message,
  code: 403,
  _httpError: 'Forbidden',
});

export const createNotFound = (message: string): HttpError => ({
  name: 'Not Found',
  message,
  code: 404,
  _httpError: 'NotFound',
});

export const createMethodNotAllowed = (message: string): HttpError => ({
  name: 'Method Not Allowed',
  message,
  code: 405,
  _httpError: 'MethodNotAllowed',
});

export const createNotAcceptable = (message: string): HttpError => ({
  name: 'Not Acceptable',
  message,
  code: 406,
  _httpError: 'NotAcceptable',
});

export const htmlTemplate: string = `<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>__TITLE__</title>
        <style>
            html {
                font-family: Helvetica, Arial, Verdana, sans-serif;
                line-height: 1.5;
                tab-size: 4;
            }

            body {
                margin: 0;
            }

            * {
                border-width: 0;
                border-style: solid;
            }

            .container {
                width: 100%
            }

            @media (min-width:640px) {
                .container {
                    max-width: 640px
                }
            }

            @media (min-width:768px) {
                .container {
                    max-width: 768px
                }
            }

            @media (min-width:1024px) {
                .container {
                    max-width: 1024px
                }
            }

            @media (min-width:1280px) {
                .container {
                    max-width: 1280px
                }
            }

            @media (min-width:1536px) {
                .container {
                    max-width: 1536px
                }
            }

            .mx-auto {
                margin-left: auto;
                margin-right: auto;
            }

            .inline-block {
                display: inline-block;
            }

            .align-top {
                vertical-align: top;
            }

            .mt-3 {
                margin-top: .75rem;
            }

            .mt-12 {
                margin-top: 3rem;
            }

            .mr-5 {
                margin-right: 1.25rem;
            }

            .pr-5 {
                padding-right: 1.25rem;
            }

            .text-gray-400 {
                --tw-text-opacity: 1;
                color: rgba(156, 163, 175, var(--tw-text-opacity));
            }

            .text-5xl {
                font-size: 3rem;
                line-height: 1;
            }

            .tracking-tighter {
                letter-spacing: -.05em;
            }

            .border-gray-400 {
                --tw-border-opacity: 1;
                border-color: rgba(156, 163, 175, var(--tw-border-opacity));
            }

            .border-r-2 {
                border-right-width: 2px;
            }
        </style>
    </head>
    <body>
        <div class="container mx-auto tracking-tighter mt-12">
            <div class="inline-block align-top text-gray-400 border-r-2 border-gray-400 pr-5 mr-5 text-5xl">__STATUS__</div>
            <div class="inline-block align-top">
                <div class="text-5xl">__TITLE__</div>
                <div class="mt-3">__BODY__</div>
            </div>
        </div>
    </body>
</html>`;
