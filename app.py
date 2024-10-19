from flask import Flask, render_template, request
import math

app = Flask(__name__)

# ひとつ以上当たる確率を計算する関数
def at_least_one_hit_probability(p, n):
    miss_prob = (1 - p) ** n
    return 1 - miss_prob

# m個以上当たる確率を計算する関数
def binomial_coefficient(n, k):
    return math.comb(n, k)

def binomial_probability(n, k, p):
    q = 1 - p
    return binomial_coefficient(n, k) * (p ** k) * (q ** (n - k))

def at_least_m_hits_probability(p, n, m):
    cumulative_prob = 0
    for k in range(m):
        cumulative_prob += binomial_probability(n, k, p)
    return 1 - cumulative_prob

# n%の確率で手に入れるために必要な回数を計算する関数
def required_trials_for_probability(p, target_prob):
    required_trials = math.log(1 - target_prob) / math.log(1 - p)
    return math.ceil(required_trials)

# ルートページ（フォームと結果を同じページで表示）
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            p = float(request.form.get('drop_rate', 0)) / 100  # パーセントを確率に変換
            n = int(request.form.get('num_trials', 1))
            m = int(request.form.get('min_hits', 1))
            target_prob = float(request.form.get('target_prob', 90)) / 100
            
            # ひとつ以上当たる確率を計算
            at_least_one_prob = at_least_one_hit_probability(p, n)

            # m個以上当たる確率を計算
            at_least_m_prob = at_least_m_hits_probability(p, n, m)
            
            # 指定した確率で手に入れるために必要な回数を計算
            required_trials = required_trials_for_probability(p, target_prob)

            return render_template('index.html', at_least_one_prob=at_least_one_prob, at_least_m_prob=at_least_m_prob,
                                   required_trials=required_trials, p=p*100, n=n, m=m, target_prob=target_prob*100)
        
        except ValueError:
            return "入力が無効です。正しい値を入力してください。"
    else:
        return render_template('index.html', at_least_one_prob=None, at_least_m_prob=None, required_trials=None)

if __name__ == '__main__':
    app.run(debug=True)
