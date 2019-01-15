realpath() {
    [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

WHEREAMI=$(dirname $(realpath "$0"))
PROJECT_ROOT=${WHEREAMI}/../..