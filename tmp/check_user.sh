#!/bin/sh
result=найден
echo "Введите имя пользователя:"
read user_name
grep -E ^$user_name: /etc/passwd > /dev/null
if test "$?" = "1"; then
	result="не $result"
fi
echo пользователь $user_name $result
