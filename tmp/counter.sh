#!/bin/sh
case $# in
	1) 
		letternum=`sed "s/[^A-Za-zА-Яа-яЁё]//g" < $1 | wc -m`
		echo Количество букв: $letternum;;
	2)
		echo Количество слов:
		wc -w "$1" "$2";;
	3)
		echo Количество строк:
		wc -l "$1" "$2" "$3";;
	*)
		echo Ошибка:
		echo Количество аргументов \< 1 или \> 3
esac
	
