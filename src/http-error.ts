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

export const createPaymentRequired = (message: string): HttpError => ({
  name: 'Payment Required',
  message,
  code: 402,
  _httpError: 'PaymentRequired',
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

export const createProxyAuthenticationRequired = (message: string): HttpError => ({
  name: 'Proxy Authentication Required',
  message,
  code: 407,
  _httpError: 'ProxyAuthenticationRequired',
});

export const createRequestTimeout = (message: string): HttpError => ({
  name: 'Request Timeout',
  message,
  code: 408,
  _httpError: 'RequestTimeout',
});

export const createConflict = (message: string): HttpError => ({
  name: 'Conflict',
  message,
  code: 409,
  _httpError: 'Conflict',
});

export const createGone = (message: string): HttpError => ({
  name: 'Gone',
  message,
  code: 410,
  _httpError: 'Gone',
});

export const createLengthRequired = (message: string): HttpError => ({
  name: 'Length Required',
  message,
  code: 411,
  _httpError: 'LengthRequired',
});

export const createPreconditionFailed = (message: string): HttpError => ({
  name: 'Precondition Failed',
  message,
  code: 412,
  _httpError: 'PreconditionFailed',
});

export const createPayloadTooLarge = (message: string): HttpError => ({
  name: 'Payload Too Large',
  message,
  code: 413,
  _httpError: 'PayloadTooLarge',
});

export const createURITooLong = (message: string): HttpError => ({
  name: 'URI Too Long',
  message,
  code: 414,
  _httpError: 'URITooLong',
});

export const createUnsupportedMediaType = (message: string): HttpError => ({
  name: 'Unsupported Media Type',
  message,
  code: 415,
  _httpError: 'UnsupportedMediaType',
});

export const createRangeNotSatisfiable = (message: string): HttpError => ({
  name: 'Range Not Satisfiable',
  message,
  code: 416,
  _httpError: 'RangeNotSatisfiable',
});

export const createExpectationFailed = (message: string): HttpError => ({
  name: 'Expectation Failed',
  message,
  code: 417,
  _httpError: 'ExpectationFailed',
});

export const createImateapot = (message: string): HttpError => ({
  name: "I'm a teapot",
  message,
  code: 418,
  _httpError: 'Imateapot',
});

export const createMisdirectedRequest = (message: string): HttpError => ({
  name: 'Misdirected Request',
  message,
  code: 421,
  _httpError: 'MisdirectedRequest',
});

export const createUnprocessableEntity = (message: string): HttpError => ({
  name: 'Unprocessable Entity',
  message,
  code: 422,
  _httpError: 'UnprocessableEntity',
});

export const createLocked = (message: string): HttpError => ({
  name: 'Locked',
  message,
  code: 423,
  _httpError: 'Locked',
});

export const createFailedDependency = (message: string): HttpError => ({
  name: 'Failed Dependency',
  message,
  code: 424,
  _httpError: 'FailedDependency',
});

export const createTooEarly = (message: string): HttpError => ({
  name: 'Too Early',
  message,
  code: 425,
  _httpError: 'TooEarly',
});

export const createUpgradeRequired = (message: string): HttpError => ({
  name: 'Upgrade Required',
  message,
  code: 426,
  _httpError: 'UpgradeRequired',
});

export const createPreconditionRequired = (message: string): HttpError => ({
  name: 'Precondition Required',
  message,
  code: 428,
  _httpError: 'PreconditionRequired',
});

export const createTooManyRequests = (message: string): HttpError => ({
  name: 'Too Many Requests',
  message,
  code: 429,
  _httpError: 'TooManyRequests',
});

export const createRequestHeaderFieldsTooLarge = (message: string): HttpError => ({
  name: 'Request Header Fields Too Large',
  message,
  code: 431,
  _httpError: 'RequestHeaderFieldsTooLarge',
});

export const createUnavailableForLegalReasons = (message: string): HttpError => ({
  name: 'Unavailable For Legal Reasons',
  message,
  code: 451,
  _httpError: 'UnavailableForLegalReasons',
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
