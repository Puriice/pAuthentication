package users

import (
	"log"
	"net/http"

	"github.com/Puriice/pAuthentication/internal/cookies/session"
	"github.com/Puriice/pAuthentication/internal/pg"
	"github.com/Puriice/pAuthentication/internal/types"
	"github.com/puriice/httplibs/pkg/middleware"
)

const DEFAULT_LANGUAGE_TAG = "en"

func isEmpty(fields ...*string) bool {
	for _, f := range fields {
		if f == nil || *f == "" {
			return true
		}
	}

	return false
}

type Handler struct {
	model types.UserModel
}

func NewHandler(model types.UserModel) *Handler {
	return &Handler{
		model: model,
	}
}

func (h *Handler) createUser(w http.ResponseWriter, r *http.Request) {
	userInfo, ok := r.Context().Value("user").(types.User)

	if !ok {
		log.Println("User or id not found in context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if isEmpty(userInfo.Username, userInfo.Firstname) {
		http.Error(w, "Invalid Body", http.StatusUnprocessableEntity)
		return
	}

	err := h.model.CreateUser(r.Context(), userInfo)

	err = pg.CheckError(err, w)

	if err != nil {
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) patchUser(w http.ResponseWriter, r *http.Request) {
	// userInfo, ok := r.Context().Value("user").(user)
	// userId := r.PathValue("id")
	// languageTag := r.PathValue("language")

	// if !ok {
	// 	log.Println("User or id not found in context")
	// 	w.WriteHeader(http.StatusInternalServerError)
	// 	return
	// }

}

func (h *Handler) deleteAccount(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("id").(string)

	if !ok {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	username := r.PathValue("username")

	if username == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	err := session.RemoveActiveAccount(&username, w, r)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = h.model.DeleteAccount(r.Context(), userId)

	err = pg.CheckError(err, w)

	if err != nil {
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) deleteUserWithLanguage(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("id").(string)
	languageTag := r.PathValue("language")

	if !ok || languageTag == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err := h.model.RemoveUserLanguage(r.Context(), userId, languageTag)

	err = pg.CheckError(err, w)

	if err != nil {
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) RegisterRoute(router *http.ServeMux) {
	userRouter := http.NewServeMux()

	pipeLine := middleware.Pipe(
		parseUserBody,
		h.queryID,
	)

	userRouter.HandleFunc("PATCH /{username}/{language}", h.patchUser)
	userRouter.HandleFunc("DELETE /{username}/all", h.deleteAccount)
	userRouter.HandleFunc("DELETE /{username}/{language}", h.deleteUserWithLanguage)

	router.Handle("POST /users", pipeLine(http.HandlerFunc(h.createUser)))
	router.Handle("/users/{username}/",
		http.StripPrefix("/users", pipeLine(userRouter)),
	)
}
