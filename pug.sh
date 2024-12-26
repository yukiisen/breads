# usage:
# pug.sh [template] [function]

# CONSTANTS:
PUBLICDIR=./public/templates
TEMPLATES=./templates/

# Variables:
func=$3
template=$1
templateFile=$2

TYPEDECLARATIONS="type $func = any;declare function $func(options: $func): string;export default $func"

jade templates/$template/$templateFile.jade --client --name $func --out $PUBLICDIR/
echo $TYPEDECLARATIONS > $PUBLICDIR/$templateFile.d.ts
echo "export default $(more $PUBLICDIR/$templateFile.js)" > $PUBLICDIR/$templateFile.js