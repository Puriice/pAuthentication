package authentication

import (
	"log"
	"net/http"

	"github.com/Puriice/pAuthentication/internal/cookies/session"
	"github.com/Puriice/pAuthentication/internal/pg"
	"github.com/Puriice/pAuthentication/internal/types"
	"github.com/Puriice/pAuthentication/pkg/password"
	"github.com/puriice/httplibs/pkg/middleware"
)

type Handler struct {
	model AuthModel
}

func NewHandler(model AuthModel) *Handler {
	return &Handler{
		model: model,
	}
}

func (s *Handler) loginHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(types.UserCredential)

	if !ok {
		log.Println("User not found in context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	hashedPassword, err := s.model.QueryPassword(r.Context(), user.Username)

	err = pg.CheckError(err, w)

	if err != nil {
		return
	}

	valid := password.ComparePassword(hashedPassword, user.Password)

	if !valid {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	session.AddActiveAccount(user.Username, w, r)
}

func (s *Handler) registerHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(types.UserCredential)

	if !ok {
		log.Println("User not found in context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	password, err := password.HashPassword(user.Password)

	if err != nil {
		log.Println("Error hashing password.", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	user.Password = password

	err = s.model.RegisterUser(r.Context(), user)

	err = pg.CheckError(err, w)

	if err != nil {
		return
	}

	session.AddActiveAccount(user.Username, w, r)
}

func (s *Handler) logoutHandler(w http.ResponseWriter, r *http.Request) {
	err := session.RemoveActiveAccount(nil, w, r)

	if err == nil {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	log.Println(err)
	w.WriteHeader(http.StatusInternalServerError)
}

func (h *Handler) RegisterRouter(router *http.ServeMux) {
	authRouter := http.NewServeMux()

	authRouter.HandleFunc("POST /login", h.loginHandler)
	authRouter.HandleFunc("POST /register", h.registerHandler)

	router.Handle("/auths/", http.StripPrefix("/auths", middleware.Pipe(
		parseBody,
		deReAuthenticate,
	)(authRouter)))

	router.HandleFunc("POST /auths/logout", h.logoutHandler)
}
