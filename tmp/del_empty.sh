#!/bin/sh
for file in `find -type f -empty`; do
	rm "$file"
done
