set -B                  # enable brace expansion
for i in {1..1000}; do
  curl 'http://localhost:3000/'
done

# Run 1000 requests after each other
#  sudo time sh ./test.sh

# Run 2000 tests in 2 threads of a 1000
# sudo time sh ./test.sh & time sh ./test.sh

# going nuts
# sudo time sh ./test.sh & time sh ./test.sh & time sh ./test.sh & time sh ./test.sh & time sh ./test.sh & time sh ./test.sh & time sh ./test.sh & time sh ./test.sh & time sh ./test.sh & time sh ./test.sh