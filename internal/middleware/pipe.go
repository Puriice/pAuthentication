package middleware

import (
	"net/http"
)

type Middleware func(http.Handler) http.Handler

func Pipe(middleware Middleware, middlewares ...Middleware) Middleware {
	return func(final http.Handler) http.Handler {
		h := final

		for i := len(middlewares) - 1; i >= 0; i-- {
			h = middlewares[i](h)
		}

		h = middleware(h)

		return h
	}
}
