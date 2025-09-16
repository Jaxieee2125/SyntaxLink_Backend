# Sử dụng một image Python nhỏ gọn
FROM python:3.9-slim

# Tạo thư mục làm việc trong container
WORKDIR /app

# KHÔNG sao chép file ở đây vì chúng sẽ được mount vào lúc runtime.

# Lệnh mặc định sẽ được thực thi khi container khởi chạy.
# Nó sẽ chạy file main.py (được mount vào), đọc từ input.txt (cũng được mount vào)
# và ghi kết quả ra output.txt (sẽ được tạo ra trong thư mục được mount).
CMD ["/bin/sh", "-c", "python main.py < input.txt > output.txt"]