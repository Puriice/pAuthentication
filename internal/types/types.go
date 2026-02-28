package types

type UserCredential struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type User struct {
	Identifier *string `json:"id"         db:"id"`
	Language   *string `json:"language"   db:"language_tag"`
	Username   *string `json:"username"   db:"username"`
	Firstname  *string `json:"firstname"  db:"firstname"`
	Middlename *string `json:"middlename" db:"middlename"`
	Lastname   *string `json:"lastname"   db:"lastname"`
	Nickname   *string `json:"nickname"   db:"nickname"`
	Profile    *string `json:"profile"    db:"profile"`
	Picture    *string `json:"picture"    db:"picture"`
	Website    *string `json:"website"    db:"website"`
	Gender     *string `json:"gender"     db:"gender"`
	Birthday   *string `json:"birthday"   db:"birthday"`
	Zoneinfo   *string `json:"zoneinfo"   db:"zoneinfo"`
	Locale     *string `json:"locale"     db:"locale"`
}
