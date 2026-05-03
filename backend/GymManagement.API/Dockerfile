FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY GymManagement.Domain/GymManagement.Domain.csproj GymManagement.Domain/
COPY GymManagement.Application/GymManagement.Application.csproj GymManagement.Application/
COPY GymManagement.Infrastructure/GymManagement.Infrastructure.csproj GymManagement.Infrastructure/
COPY GymManagement.API/GymManagement.API.csproj GymManagement.API/

RUN dotnet restore GymManagement.API/GymManagement.API.csproj

COPY . .
RUN dotnet publish GymManagement.API/GymManagement.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://0.0.0.0:10000
EXPOSE 10000

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "GymManagement.API.dll"]
