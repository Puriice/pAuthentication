package types

type UserCredential struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type User struct {
	Identifier *string `json:"id"`
	Language   *string `json:"language"`
	Username   *string `json:"username"`
	Firstname  *string `json:"firstname"`
	Middlename *string `json:"middlename"`
	Lastname   *string `json:"lastname"`
	Nickname   *string `json:"nickname"`
	Profile    *string `json:"profile"`
	Picture    *string `json:"picture"`
	Website    *string `json:"website"`
	Gender     *string `json:"gender"`
	Birthday   *string `json:"birthday"`
	Zoneinfo   *string `json:"zoneinfo"`
	Locale     *string `json:"locale"`
}
