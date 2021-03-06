/****** Script for SelectTopNRows command from SSMS  ******/

use [Spotify]
go


---artistas----------------------------------------------------
---------------------------------------------------------------
SELECT *
  FROM [dbo].[Songs] a
       inner join [dbo].[SongArtists] b on a.SongId = b.SongId
	   inner join [dbo].[Artists] c on c.ArtitId = b.ArtistId
  ------------------------------------------------------------.


  
---artistas----------------------------------------------------
---------------------------------------------------------------
SELECT a.SongTittle
  FROM [dbo].[Songs] a
       inner join [dbo].[SongArtists] b on a.SongId = b.SongId
	   inner join [dbo].[Artists] c on c.ArtitId = b.ArtistId
	   inner join [dbo].[SongGenres] d on d.SongId = a.SongId 
	   inner join [dbo].[Genres] g on g.GenreId = d.GenreId 
  WHERE g.GenreName like '%Metal%'
  group by a.SongTittle
  
  ------------------------------------------------------------.
  
  select * 
    from [dbo].[Genres] a 
   where a.GenreName like '%metal%' 


 SELECT a.SongTittle
  FROM [dbo].[Songs] a
       inner join [dbo].[SongGenres] d on d.SongId = a.SongId 
  WHERE d.GenreId in ( select a.GenreId
    from [dbo].[Genres] a 
   where a.GenreName like '%metal%' )