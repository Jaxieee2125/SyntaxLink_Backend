# Sử dụng một image có sẵn trình biên dịch g++
FROM gcc:latest

WORKDIR /app

# Lệnh CMD sẽ được chia thành 2 bước:
# 1. Biên dịch file main.cpp ra file thực thi tên là 'main'
# 2. Chạy file 'main', đọc từ input.txt và ghi ra output.txt
CMD ["/bin/sh", "-c", "g++ main.cpp -o main && ./main < input.txt > output.txt"]