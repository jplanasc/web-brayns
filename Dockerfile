FROM python:3.7-slim-buster

RUN pip install -i https://bbpteam.epfl.ch/repository/devpi/simple/ bluepy[all]

RUN mkdir -p /var/www/cgi-bin
RUN mkdir -p /var/log
RUN mkdir -p /gpfs

ADD ./build /var/www/
ADD ./backend/cgi-bin/ /var/www/cgi-bin

WORKDIR /var/www
CMD ["/usr/local/bin/python", "-m", "http.server", "--cgi", "80"]

EXPOSE 80
