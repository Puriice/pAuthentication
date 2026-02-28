package types

type UserCredential struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type User struct {
	Identifier *string `json:"id,omitempty"         db:"id"`
	Language   *string `json:"language,omitempty"   db:"language_tag"`
	Username   *string `json:"username,omitempty"   db:"username"`
	Firstname  *string `json:"firstname,omitempty"  db:"firstname"`
	Middlename *string `json:"middlename,omitempty" db:"middle"`
	Lastname   *string `json:"lastname,omitempty"   db:"lastname"`
	Nickname   *string `json:"nickname,omitempty"   db:"nickname"`
	Profile    *string `json:"profile,omitempty"    db:"profile"`
	Picture    *string `json:"picture,omitempty"    db:"picture"`
	Website    *string `json:"website,omitempty"    db:"website"`
	Gender     *string `json:"gender,omitempty"     db:"gender"`
	Birthday   *string `json:"birthday,omitempty"   db:"birthday"`
	Zoneinfo   *string `json:"zoneinfo,omitempty"   db:"zoneinfo"`
	Locale     *string `json:"locale,omitempty"     db:"locale"`
}
