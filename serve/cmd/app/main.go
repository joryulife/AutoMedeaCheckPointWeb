package main

import (
	"bufio"
	"strings"

	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"io"
	"io/ioutil"

	"strconv"
	//"strings"
	//"time"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
	"github.com/joryulife/AutoMediaCheckPointWeb/pkg/GCP"
	"github.com/joryulife/AutoMediaCheckPointWeb/pkg/crypto"
	"github.com/joryulife/AutoMediaCheckPointWeb/pkg/movie"
	"github.com/joryulife/AutoMediaCheckPointWeb/pkg/sound"
	StringTime "github.com/joryulife/AutoMediaCheckPointWeb/pkg/time"
	"github.com/joryulife/AutoMediaCheckPointWeb/pkg/word"
)

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"unique;not null"`
	Password string `json:"password" `
}

type timeStampJson struct {
	FileName string        `json:"filename"`
	Time     []json.Number `json:"timeArray"`
	Flag     []bool        `json:"flagArray"`
}

type outputSource struct {
	Time  string `json:"time"`
	Movie string `json:"movie"`
}

func toTime(t json.Number) string {
	var mod, h, m, s int64
	S := t.String()
	S = strings.Split(S, ".")[0]
	T, _ := strconv.ParseInt(S, 10, 64)
	mod = T % 3600
	h = (T - mod) / 3600
	mod = (T - h*3600) % 60
	m = (T - h*3600 - mod) / 60
	s = (T - h*3600 - m*60)
	fmt.Println(h, m, s)
	var sh, sm, ss string
	if h < 10 {
		sh = "0" + strconv.FormatInt(h, 10)
	} else {
		sh = strconv.FormatInt(h, 10)
	}
	if m < 10 {
		sm = "0" + strconv.FormatInt(m, 10)
	} else {
		sm = strconv.FormatInt(m, 10)
	}
	if s < 10 {
		ss = "0" + strconv.FormatInt(s, 10)
	} else {
		ss = strconv.FormatInt(s, 10)
	}
	var timeString = sh + ":" + sm + ":" + ss
	return timeString
}

func gormConnect() *gorm.DB {
	DBMS := "mysql"
	USER := "root"
	PASS := "puroisenn96"
	DBNAME := "amcpw"
	// MySQLだと文字コードの問題で"?parseTime=true"を末尾につける必要がある
	CONNECT := USER + ":" + PASS + "@/" + DBNAME + "?parseTime=true"
	db, err := gorm.Open(DBMS, CONNECT)

	if err != nil {
		panic(err.Error())
	}
	return db
}

// DBの初期化
func dbInit() {
	db := gormConnect()

	// コネクション解放解放
	defer db.Close()
	db.AutoMigrate(&User{}) //構造体に基づいてテーブルを作成
}

func createUser(username string, password string) []error {
	passwordEncrypt, _ := crypto.PasswordEncrypt(password)
	db := gormConnect()
	defer db.Close()
	// Insert処理
	if err := db.Create(&User{Username: username, Password: passwordEncrypt}); err.Error != nil {
		log.Println(err.Error)
		return err.GetErrors()
	}
	return nil
}

func getUser(username string) User {
	db := gormConnect()
	var user User
	db.First(&user, "username = ?", username)
	db.Close()
	return user
}

func main() {
	router := gin.Default()
	gs := "gs://automediacheckpoint/"
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
		},
		AllowMethods: []string{
			"POST",
			"GET",
			"PUT",
		},
		AllowHeaders: []string{
			"Access-Control-Allow-Credentials",
			"Access-Control-Allow-Headers",
			"Content-Type",
			"Content-Length",
			"Accept-Encoding",
			"Authorization",
			"x-requested-with",
		},
		AllowCredentials: false,
	}))
	dbInit()

	// ユーザー登録 curl -X POST http://localhost:8080/SIGNUP -d "username=test3" -d "password=333"
	router.POST("/SIGNUP", func(c *gin.Context) {
		var form User
		// バリデーション処理
		if err := c.Bind(&form); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"name": "null", "id": "null"})
		} else {
			username := form.Username
			password := form.Password
			// 登録ユーザーが重複していた場合にはじく処理
			if err := createUser(username, password); err != nil {
				log.Println(err)
				c.JSON(http.StatusBadRequest, gin.H{"name": "null", "id": "null"})
			} else {
				user := getUser(username)
				ui := uint64(user.ID)
				i := strconv.FormatUint(ui, 10)
				if err := os.Mkdir("../../lib/time/"+i, 0777); err != nil {
					fmt.Println(err)
				}
				if err := os.Mkdir("../../lib/movie/"+i, 0777); err != nil {
					fmt.Println(err)
				}
				if err := os.Mkdir("../../lib/wav/"+i, 0777); err != nil {
					fmt.Println(err)
				}
				c.JSON(http.StatusOK, gin.H{"name": user.Username, "id": strconv.Itoa(int(user.ID))})
			}
		}
	})

	// ユーザーログイン curl -X POST http://localhost:8080/LOGIN -d "username=test1" -d "password=111"
	router.POST("/LOGIN", func(c *gin.Context) {
		var form User
		if err := c.Bind(&form); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"name": "null", "id": "null"})
		} else {
			// DBから取得したユーザーパスワード(Hash)
			dbPassword := getUser(form.Username).Password
			log.Println(dbPassword)
			// フォームから取得したユーザーパスワード
			formPassword := form.Password
			// ユーザーパスワードの比較
			if err := crypto.CompareHashAndPassword(dbPassword, formPassword); err != nil {
				log.Println("ログインできませんでした")
				log.Println(err)
				c.JSON(http.StatusBadRequest, gin.H{"name": "null", "id": "null"})
			} else {
				log.Println("ログインできました")
				user := getUser(form.Username)
				c.JSON(http.StatusOK, gin.H{"name": user.Username, "id": strconv.Itoa(int(user.ID))})
			}
		}
	})

	//FILE確認 curl -X POST "http://localhost:8080/FILES?ID=1"
	router.POST("/FILES", func(c *gin.Context) {
		UserId := c.Query("ID")
		TimeSourceFile := dirwalk("../../lib/time/" + UserId + "/")
		MovieSourceFile := dirwalk("../../lib/movie/" + UserId + "/")
		fmt.Println("timefile", TimeSourceFile)
		fmt.Println("moviefile", MovieSourceFile)
		c.JSON(http.StatusOK, gin.H{"time": TimeSourceFile, "movie": MovieSourceFile})
	})

	//アップロード curl -X POST "http://localhost:8080/MOVIEUPLOAD?ID=1" -F "file=@./test1.MP4;type=video/mp4"
	router.POST("/MOVIEUPLOAD", func(c *gin.Context) {
		UserId := c.Query("ID")
		fmt.Println(UserId)
		file, header, err := c.Request.FormFile("file")
		if err != nil {
			log.Println(err)
			c.String(http.StatusBadRequest, "Bad request")
			return
		}
		fileName := header.Filename
		//dir, _ := os.Getwd()
		out, err := os.Create("../../lib/movie/" + UserId + "/" + fileName)
		if err != nil {
			log.Fatal(err)
		}
		defer out.Close()
		_, err = io.Copy(out, file)
		if err != nil {
			log.Fatal(err)
		}
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	//TIMESTAMP保存
	/*
		curl -X POST "http://localhost:8080/SAVESTAMP?ID=1" -H "Content-Type: application/json" -d '{"filename":"test1","timeArray":[0,60,180,240,300],"flagArray":[true,false,true,true,true]}'
	*/
	router.POST("/SAVESTAMP", func(c *gin.Context) {
		UserId := c.Query("ID")
		var time timeStampJson
		if err := c.ShouldBindJSON(&time); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		data := ""
		for i, t := range time.Time {
			s := toTime(t)
			if time.Flag[i] {
				data += s + " 1\n"
			} else {
				data += s + " 0\n"
			}
		}
		path := "../../lib/time/" + UserId + "/" + time.FileName + ".txt"
		fmt.Println(path)
		err := ioutil.WriteFile(path, []byte(data), 0664)
		if err != nil {
			fmt.Println(err)
		} else {
			c.JSON(http.StatusOK, gin.H{
				"status": "ok",
			})
		}
	})

	//見出し作成 curl -X POST http://localhost:8080/MAKEINDEX -d "timefile=test1.txt" -d "moviefile=test1.MP4" -d "id=1"
	//			curl -X POST "http://localhost:8080/makeindex?timefile=test1.txt&moviefile=test1.MP4&id=1"
	router.POST("/MAKEINDEX", func(c *gin.Context) {
		var CheckPoint []float64
		var CheckPointSlice []string
		var flagSlice []bool
		var texts []string
		var source outputSource
		if err := c.ShouldBindJSON(&source); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		flag := "test"
		TimeName := source.Time
		MovieName := source.Movie
		id := c.Query("id")
		cur, _ := os.Getwd()
		fmt.Println(cur)
		path := "../../lib/time/" + id + "/" + TimeName
		fp, err := os.Open(path)
		if flag == "test" {
			fp.Close()
			c.JSON(
				http.StatusOK,
				gin.H{
					"output": "",
				},
			)
		} else if err != nil {
			fp.Close()
			c.JSON(
				http.StatusOK,
				gin.H{
					"output": "test",
				},
			)
		} else {
			timeString := ""
			scanner := bufio.NewScanner(fp)
			for scanner.Scan() {
				st := scanner.Text()
				time := strings.Split(st, " ")
				timeString += time[0] + "\n"
				if time[1] == "1" {
					flagSlice = append(flagSlice, true)
				} else {
					flagSlice = append(flagSlice, false)
				}
				CheckPointSlice = append(CheckPointSlice, time[0])
			}
			fp.Close()
			CheckPoint = StringTime.StringToTime(timeString)
			fmt.Println(CheckPoint)
			movie.MtoW(MovieName, id)
			sound.CutSoundFile(MovieName, CheckPoint, id)
			MovieRemoveExtension := strings.Split(MovieName, ".")[0]
			for i := 0; i < len(CheckPoint)-1; i++ {

				if flagSlice[i] {
					TextCut := GCP.Captionasync(gs + id + MovieRemoveExtension + "cut" + strconv.Itoa(i) + ".wav")
					fmt.Println(TextCut)
					texts = append(texts, TextCut)
				}
			}
			//fmt.Println("330 texts : ", texts)
			s := word.ReturnKeyWords(texts)
			output := ""
			var keyWords string
			fmt.Println("335 CheckPoint :", CheckPoint)
			fmt.Println("335 CheckPointSlice :", CheckPointSlice)
			t := 0
			for i := 0; i < len(CheckPoint)-1; i++ {
				if flagSlice[i] {
					keyWords = ""
					for j := 0; j < len(s[t]); j++ {
						keyWords += s[t][j] + " "
					}
					output += CheckPointSlice[i] + " " + keyWords + "\n"
					t += 1
				} else {
					output += CheckPointSlice[i] + " " + "解析区間外" + "\n"
				}
			}
			c.JSON(
				http.StatusOK,
				gin.H{
					"output": output,
				},
			)
		}
	})

	router.Run(":8080")
}

func dirwalk(dir string) []string {
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		panic(err)
	}

	var paths []string
	for _, file := range files {
		if file.IsDir() {
			paths = append(paths, dirwalk(filepath.Join(dir, file.Name()))...)
			continue
		}
		if file.Name() != ".DS_Store" {
			paths = append(paths, file.Name())
		}
	}

	return paths
}
