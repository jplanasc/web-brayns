FROM python:3.7-slim-buster

RUN mkdir -p /var/www/cgi-bin
RUN mkdir -p /var/log
RUN mkdir -p /gpfs

ADD ./build /var/www/
ADD ./backend/cgi-bin/ /var/www/cgi-bin

#RUN python -m http.server --cgi 80 2> /var/log/http.err > /var/log/http.out
WORKDIR /var/www
CMD ["/usr/local/bin/python", "-m", "http.server", "--cgi", "80"]
# 2> /var/log/http.err > /var/log/http.out"

EXPOSE 80
