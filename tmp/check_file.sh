#!/bin/sh
echo "Введите путь к файлу:"
read file_path
if [ -d "$file_path" ]; then
	ls -l "$file_path"
else
	file "$file_path"
fi
